from django.shortcuts import render
from .models import Hearing, HearingAttendance, NonWorkingDay
from cases.models import Case
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from .serializers import HearingSerializer, HearingAttendanceSerializer
from django.contrib.auth import get_user_model
from case_persons.models import CasePerson
from django.db.models import Count
from datetime import datetime, timedelta

User = get_user_model()

# Time slots available for hearings (09:00 is the default)
TIME_SLOTS = ["09:00", "10:00", "11:00", "08:00", "13:00", "14:00", "15:00", "16:00"]


def get_available_slots(date, exclude_hearing_id=None):
    """
    Get available time slots for a given date.
    Returns list of available time slots and their load status.
    """
    if isinstance(date, str):
        date = datetime.strptime(date, "%Y-%m-%d").date()
    
    # Get hearings on this date
    hearings_query = Hearing.objects.filter(hearing_date=date)
    if exclude_hearing_id:
        hearings_query = hearings_query.exclude(id=exclude_hearing_id)
    
    occupied_times = set(
        h.time.strftime("%H:%M") if h.time else None 
        for h in hearings_query
    )
    occupied_times.discard(None)
    
    slots = []
    for slot in TIME_SLOTS:
        slots.append({
            "time": slot,
            "available": slot not in occupied_times,
            "occupied": slot in occupied_times
        })
    
    return slots


def get_optimal_time_slot(date):
    """
    Get the optimal (least busy) time slot for a given date.
    Implements smart load balancing.
    """
    if isinstance(date, str):
        date = datetime.strptime(date, "%Y-%m-%d").date()
    
    # Count hearings per time slot
    slot_counts = {slot: 0 for slot in TIME_SLOTS}
    
    hearings = Hearing.objects.filter(hearing_date=date)
    for h in hearings:
        if h.time:
            time_str = h.time.strftime("%H:%M")
            if time_str in slot_counts:
                slot_counts[time_str] += 1
    
    # Find the least busy slot
    min_count = min(slot_counts.values())
    optimal_slots = [slot for slot, count in slot_counts.items() if count == min_count]
    
    return optimal_slots[0] if optimal_slots else TIME_SLOTS[0]


def get_alternative_dates(start_date, num_alternatives=3):
    """
    Get alternative dates (skipping Sundays and with least load).
    """
    if isinstance(start_date, str):
        start_date = datetime.strptime(start_date, "%Y-%m-%d").date()
    
    alternatives = []
    current_date = start_date + timedelta(days=1)
    
    while len(alternatives) < num_alternatives:
        # Skip Sundays
        if current_date.weekday() != 6:
            # Count hearings on this date
            hearing_count = Hearing.objects.filter(hearing_date=current_date).count()
            optimal_slot = get_optimal_time_slot(current_date)
            
            alternatives.append({
                "date": current_date.isoformat(),
                "day_name": current_date.strftime("%A"),
                "hearing_count": hearing_count,
                "suggested_time": optimal_slot,
                "load_status": "light" if hearing_count < 4 else ("moderate" if hearing_count < 7 else "heavy")
            })
        
        current_date += timedelta(days=1)
    
    # Sort by hearing count (prefer less busy days)
    alternatives.sort(key=lambda x: x["hearing_count"])
    
    return alternatives


class HearingView(APIView):
    def get(self, request):
        role = request.query_params.get("role")
        email = request.query_params.get("email")

        if role == "user":
            try:
                user_id = CasePerson.objects.filter(email=email).first().id
                cases = Case.objects.filter(complainants=user_id)
                # print(user_id, email)
            except AttributeError:
                cases = Case.objects.none()
        else:
            cases = Case.objects.all()
        
        case_ids = [case.id for case in cases]
        hearings = Hearing.objects.filter(case_id__in=case_ids)
        # print("my hearings", hearings)
        # print("case ids", case_ids)
        serializer = HearingSerializer(hearings, many=True)

        if not hearings.exists():
            return Response({"error": "No hearings found for this case."}, status=status.HTTP_200_OK)
        return Response(serializer.data, status=status.HTTP_200_OK)
    

class HearingCaseView(APIView):
    def get(self, request):
        case_id = request.query_params.get("case_id")
        hearings = Hearing.objects.filter(case_id=case_id)
        serializer = HearingSerializer(hearings, many=True)

        if not hearings.exists():
            return Response({"error": "No hearings found for this case."}, status=status.HTTP_200_OK)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def put(self, request, pk):
        try:
            hearing = Hearing.objects.get(pk=pk)
        except Hearing.DoesNotExist:
            return Response({"error": "Hearing not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = HearingSerializer(hearing, data=request.data, partial=True)

        if serializer.is_valid():
            hearing = serializer.save()
            response_data = HearingSerializer(hearing).data
            return Response(response_data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class HearingAttendanceView(APIView):
    def get(self, request):
        hearing_id = request.query_params.get("hearing_id")
        
        if not hearing_id:
            attendances = HearingAttendance.objects.all()
        else:
            attendances = HearingAttendance.objects.filter(hearing_id=hearing_id)

        serializer = HearingAttendanceSerializer(attendances, many=True)

        if not attendances.exists():
            return Response({"error": "No attendance records found for this hearing."}, status=status.HTTP_200_OK)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request):
        data = request.data
        serializer = HearingAttendanceSerializer(data=data, many=True)

        if serializer.is_valid():
            serializer.save()
            return Response({"success": "Attendance records created."}, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class SetCaseHearingsView(APIView):
    def post(self, request, pk):
        case_id = pk 
        hearings_data = request.data.get("hearings", [])

        print("Case ID:", case_id)
        print("Received Data:", hearings_data)

        try:
            case = Case.objects.get(id=case_id)
            created_hearings = []  # Track created hearings for sync
            
            for h_data in hearings_data:

                raw_date = h_data.get("hearing_date")
                clean_date = None
                if raw_date:
                    if "T" in raw_date:
                        clean_date = raw_date.split("T")[0]
                    else:
                        clean_date = raw_date

                h_number = h_data.get("hearing_number")
                
                current_status = "pending_schedule"
                current_remarks = h_data.get("remarks") or "Subsequent hearing pending."
                    

                lupon_id = h_data.get("lupon_member_id")
                
                hearing = Hearing.objects.create(
                    case=case,  
                    hearing_number=h_number,
                    hearing_date=clean_date, 
                    time=h_data.get("time"),
                    lupon_member_id=lupon_id,
                    remarks=current_remarks,
                    hearing_status=current_status,
                )
                created_hearings.append(hearing)

            # Auto-sync created hearings to Google Calendar
            try:
                from google_calendar.views import sync_hearing_to_google
                for hearing in created_hearings:
                    sync_hearing_to_google(hearing, action="create")
            except Exception as sync_error:
                print(f"[Auto-Sync] Error syncing hearings: {sync_error}")

            return Response({"success": "Hearings successfully created."}, status=status.HTTP_200_OK)

        except Case.DoesNotExist:
            return Response({"error": "Case not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print("Error saving hearing:", str(e)) 
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class UpdateHearingView(APIView):
    def put(self, request, pk):
        
        try:
            hearing = Hearing.objects.get(pk=pk)
        except Hearing.DoesNotExist:
            return Response({"error": "Hearing not found."}, status=status.HTTP_404_NOT_FOUND)

        data = request.data.copy()

        # FIX DATE: Convert "2025-12-24T00:00:00.000Z" -> "2025-12-24"
        raw_date = data.get("hearing_date")
        clean_date = None
        if raw_date:
            if "T" in raw_date:
                clean_date = raw_date.split("T")[0]
            else:
                clean_date = raw_date

        data['hearing_date'] = clean_date
        
        if 'time' in data and data['time'] == "":
            data['time'] = None
        
        if 'lupon_member' in data:
            data['lupon_member'] = data['lupon_member']
            print("Lupon Member ID:", data['lupon_member'])

        serializer = HearingSerializer(hearing, data=data, partial=True)

        if serializer.is_valid():
            hearing = serializer.save()
            print("Updated:", HearingSerializer(hearing).data)

            # Auto-sync updated hearing to Google Calendar
            try:
                from google_calendar.views import sync_hearing_to_google
                sync_hearing_to_google(hearing, action="update")
            except Exception as sync_error:
                print(f"[Auto-Sync] Error syncing hearing update: {sync_error}")

            return Response(HearingSerializer(hearing).data, status=status.HTTP_200_OK)
        
        print("Serializer Errors:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CheckTimeConflictView(APIView):
    """
    Check if a time slot is available and suggest alternatives if not.
    
    POST /api/check-time-conflict/
    {
        "date": "2026-01-15",
        "time": "09:00",
        "exclude_hearing_id": null  // Optional
    }
    """
    def post(self, request):
        data = request.data
        date = data.get("date")
        requested_time = data.get("time")
        exclude_id = data.get("exclude_hearing_id")
        
        if not date:
            return Response(
                {"error": "date is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get all slots for this date
        slots = get_available_slots(date, exclude_id)
        
        # Check if requested time is available
        is_available = True
        if requested_time:
            for slot in slots:
                if slot["time"] == requested_time:
                    is_available = slot["available"]
                    break
        
        # If not available, get alternative suggestions
        alternatives = []
        if not is_available:
            # Same day alternatives
            same_day_alternatives = [s for s in slots if s["available"]][:3]
            
            # Different day alternatives
            other_day_alternatives = get_alternative_dates(date, 3)
            
            alternatives = {
                "same_day": same_day_alternatives,
                "other_days": other_day_alternatives
            }
        
        return Response({
            "date": date,
            "requested_time": requested_time,
            "is_available": is_available,
            "all_slots": slots,
            "alternatives": alternatives if not is_available else None,
            "suggested_time": get_optimal_time_slot(date)
        }, status=status.HTTP_200_OK)


class GetOptimalSlotView(APIView):
    """
    Get the optimal (least busy) time slot for scheduling.
    Implements smart load balancing.
    
    GET /api/optimal-slot/?date=2026-01-15
    """
    def get(self, request):
        date = request.query_params.get("date")
        
        if not date:
            return Response(
                {"error": "date query parameter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        optimal_time = get_optimal_time_slot(date)
        slots = get_available_slots(date)
        
        # Calculate load distribution
        total_hearings = Hearing.objects.filter(
            hearing_date=datetime.strptime(date, "%Y-%m-%d").date()
        ).count()
        
        load_status = "light"
        if total_hearings >= 7:
            load_status = "heavy"
        elif total_hearings >= 4:
            load_status = "moderate"
        
        return Response({
            "date": date,
            "optimal_time": optimal_time,
            "total_hearings": total_hearings,
            "load_status": load_status,
            "all_slots": slots,
            "alternative_dates": get_alternative_dates(date, 3) if load_status == "heavy" else None
        }, status=status.HTTP_200_OK)


class CalendarHeatMapView(APIView):
    """
    Get hearing load data for calendar heat map visualization.
    Returns daily hearing counts with color-coded load status.
    
    GET /api/calendar-heatmap/?month=2026-01
    """
    def get(self, request):
        month_str = request.query_params.get("month")  # Format: YYYY-MM
        
        if not month_str:
            # Default to current month
            now = datetime.now()
            month_str = now.strftime("%Y-%m")
        
        try:
            year, month = map(int, month_str.split("-"))
        except ValueError:
            return Response(
                {"error": "Invalid month format. Use YYYY-MM"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get first and last day of month
        first_day = datetime(year, month, 1).date()
        if month == 12:
            last_day = datetime(year + 1, 1, 1).date() - timedelta(days=1)
        else:
            last_day = datetime(year, month + 1, 1).date() - timedelta(days=1)
        
        # Get hearing counts per day
        hearings_by_day = (
            Hearing.objects.filter(
                hearing_date__gte=first_day,
                hearing_date__lte=last_day
            )
            .values("hearing_date")
            .annotate(count=Count("id"))
        )
        
        # Build heat map data
        heat_map = {}
        current = first_day
        while current <= last_day:
            date_str = current.isoformat()
            count = next(
                (h["count"] for h in hearings_by_day if h["hearing_date"] == current),
                0
            )
            
            # Determine color/status
            if count == 0:
                color = "#E5E7EB"  # gray-200
                load = "empty"
            elif count <= 3:
                color = "#10B981"  # green-500
                load = "light"
            elif count <= 6:
                color = "#F59E0B"  # amber-500
                load = "moderate"
            else:
                color = "#EF4444"  # red-500
                load = "heavy"
            
            heat_map[date_str] = {
                "count": count,
                "color": color,
                "load": load,
                "is_sunday": current.weekday() == 6
            }
            current += timedelta(days=1)
        
        return Response({
            "month": month_str,
            "heat_map": heat_map,
            "legend": {
                "empty": {"color": "#E5E7EB", "label": "No hearings"},
                "light": {"color": "#10B981", "label": "1-3 hearings"},
                "moderate": {"color": "#F59E0B", "label": "4-6 hearings"},
                "heavy": {"color": "#EF4444", "label": "7+ hearings"}
            }
        }, status=status.HTTP_200_OK)


class LuponWorkloadView(APIView):
    """
    Get Lupon member workload distribution for balanced assignment.
    
    GET /api/lupon-workload/
    GET /api/lupon-workload/?month=2026-01
    """
    def get(self, request):
        from lupon_members.models import LuponMember
        
        month_str = request.query_params.get("month")
        
        # Build date filter
        if month_str:
            try:
                year, month = map(int, month_str.split("-"))
                first_day = datetime(year, month, 1).date()
                if month == 12:
                    last_day = datetime(year + 1, 1, 1).date() - timedelta(days=1)
                else:
                    last_day = datetime(year, month + 1, 1).date() - timedelta(days=1)
                date_filter = {"hearing_date__gte": first_day, "hearing_date__lte": last_day}
            except ValueError:
                date_filter = {}
        else:
            # Current month by default
            now = datetime.now()
            first_day = datetime(now.year, now.month, 1).date()
            date_filter = {"hearing_date__gte": first_day}
        
        members = LuponMember.objects.all()
        workloads = []
        
        for member in members:
            # Count hearings assigned to this member
            hearing_count = Hearing.objects.filter(
                lupon_member=member,
                **date_filter
            ).count()
            
            # Count completed hearings
            completed_count = Hearing.objects.filter(
                lupon_member=member,
                hearing_status="completed",
                **date_filter
            ).count()
            
            workloads.append({
                "member_id": member.id,
                "name": f"{member.first_name} {member.last_name}",
                "position": member.position if hasattr(member, 'position') else "Member",
                "total_hearings": hearing_count,
                "completed_hearings": completed_count,
                "pending_hearings": hearing_count - completed_count,
                "load_level": "light" if hearing_count < 5 else ("moderate" if hearing_count < 10 else "heavy")
            })
        
        # Sort by workload (least busy first for assignment suggestions)
        workloads.sort(key=lambda x: x["total_hearings"])
        
        # Suggest least busy member
        suggested = workloads[0] if workloads else None
        
        return Response({
            "workloads": workloads,
            "suggested_member": suggested,
            "filter_month": month_str or "current"
        }, status=status.HTTP_200_OK)


class EarlyWarningView(APIView):
    """
    Detect cases at risk of escalation based on hearing overrun and delays.
    
    GET /api/early-warning/
    """
    def get(self, request):
        from cases.models import Case
        
        warnings = []
        now = datetime.now()
        
        # Get active cases (not resolved, rejected, or cancelled)
        active_cases = Case.objects.exclude(
            case_status__in=["resolved", "rejected", "cancelled"]
        ).select_related("case_type")
        
        for case in active_cases:
            risk_factors = []
            risk_score = 0
            
            # Get hearing info
            hearings = Hearing.objects.filter(case=case).order_by("hearing_number")
            hearing_count = hearings.count()
            predicted = case.predicted_hearings or 3
            
            # Factor 1: Exceeding predicted hearings
            if hearing_count > predicted:
                overrun = hearing_count - predicted
                risk_score += overrun * 15
                risk_factors.append({
                    "type": "hearing_overrun",
                    "message": f"Hearings exceed prediction ({hearing_count}/{predicted})",
                    "severity": "high" if overrun >= 2 else "medium"
                })
            
            # Factor 2: Case aging without progress
            if case.date_filed:
                age_days = (now - case.date_filed.replace(tzinfo=None)).days
                
                # Check for stagnation (old case with few completed hearings)
                completed = hearings.filter(hearing_status="completed").count()
                if age_days > 30 and completed < 2:
                    risk_score += 20
                    risk_factors.append({
                        "type": "stagnation",
                        "message": f"Case is {age_days} days old with only {completed} completed hearings",
                        "severity": "high"
                    })
                elif age_days > 60:
                    risk_score += 10
                    risk_factors.append({
                        "type": "aging",
                        "message": f"Case has been open for {age_days} days",
                        "severity": "medium"
                    })
            
            # Factor 3: Multiple rescheduled hearings
            rescheduled = hearings.filter(hearing_status="rescheduled").count()
            if rescheduled >= 2:
                risk_score += rescheduled * 10
                risk_factors.append({
                    "type": "rescheduling",
                    "message": f"{rescheduled} hearings have been rescheduled",
                    "severity": "medium"
                })
            
            # Factor 4: High severity case with slow progress
            severity = case.case_type.severity if case.case_type else 1
            if severity >= 3 and hearing_count >= predicted and case.case_status != "resolved":
                risk_score += 15
                risk_factors.append({
                    "type": "high_severity_delay",
                    "message": "High severity case exceeding expected timeline",
                    "severity": "high"
                })
            
            # Only include cases with warnings
            if risk_factors:
                risk_level = "critical" if risk_score >= 40 else ("high" if risk_score >= 25 else "medium")
                
                warnings.append({
                    "case_id": case.id,
                    "case_type": case.case_type.case_name if case.case_type else "Unknown",
                    "case_status": case.case_status,
                    "risk_score": risk_score,
                    "risk_level": risk_level,
                    "risk_factors": risk_factors,
                    "hearing_count": hearing_count,
                    "predicted_hearings": predicted,
                    "recommendation": "Consider escalation review" if risk_level == "critical" else "Monitor closely"
                })
        
        # Sort by risk score (highest first)
        warnings.sort(key=lambda x: x["risk_score"], reverse=True)
        
        return Response({
            "warnings": warnings,
            "total_at_risk": len(warnings),
            "critical_count": len([w for w in warnings if w["risk_level"] == "critical"]),
            "high_count": len([w for w in warnings if w["risk_level"] == "high"])
        }, status=status.HTTP_200_OK)


class LuponCaseMatchingView(APIView):
    """
    Suggest the best Lupon member for a case based on expertise and success rate.
    
    GET /api/lupon-match/?case_type_id=1
    """
    def get(self, request):
        from lupon_members.models import LuponMember
        from cases.models import CaseType
        
        case_type_id = request.query_params.get("case_type_id")
        
        if not case_type_id:
            return Response(
                {"error": "case_type_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            case_type = CaseType.objects.get(id=case_type_id)
        except CaseType.DoesNotExist:
            return Response(
                {"error": "Case type not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        members = LuponMember.objects.all()
        member_stats = []
        
        for member in members:
            # Get hearings for this case type handled by this member
            member_hearings = Hearing.objects.filter(
                lupon_member=member,
                case__case_type=case_type
            )
            
            total = member_hearings.count()
            completed = member_hearings.filter(hearing_status="completed").count()
            
            # Get resolved cases count
            resolved_cases = member_hearings.filter(
                case__case_status="resolved"
            ).values("case").distinct().count()
            
            # Calculate success rate
            if total > 0:
                success_rate = (completed / total) * 100
            else:
                success_rate = 0
            
            # Current workload (this month)
            now = datetime.now()
            current_workload = Hearing.objects.filter(
                lupon_member=member,
                hearing_date__month=now.month,
                hearing_date__year=now.year
            ).count()
            
            # Calculate match score
            experience_score = min(total * 5, 50)  # Max 50 for experience
            success_score = success_rate * 0.3  # Max 30 for success rate  
            availability_score = max(20 - current_workload * 2, 0)  # Higher if less busy
            
            match_score = experience_score + success_score + availability_score
            
            member_stats.append({
                "member_id": member.id,
                "name": f"{member.first_name} {member.last_name}",
                "experience_with_type": total,
                "completed_hearings": completed,
                "resolved_cases": resolved_cases,
                "success_rate": round(success_rate, 1),
                "current_workload": current_workload,
                "match_score": round(match_score, 1),
                "recommendation": "Highly recommended" if match_score >= 60 else ("Recommended" if match_score >= 40 else "Available")
            })
        
        # Sort by match score
        member_stats.sort(key=lambda x: x["match_score"], reverse=True)
        
        best_match = member_stats[0] if member_stats else None
        
        return Response({
            "case_type": case_type.case_name,
            "best_match": best_match,
            "all_matches": member_stats,
            "matching_criteria": [
                "Experience with this case type",
                "Historical success rate",
                "Current workload availability"
            ]
        }, status=status.HTTP_200_OK)


# ============================================
# Non-Working Day Management
# ============================================

def get_next_working_day(from_date):
    """
    Get the next working day (skipping Sundays and existing non-working days).
    """
    if isinstance(from_date, str):
        from_date = datetime.strptime(from_date, "%Y-%m-%d").date()
    
    next_day = from_date + timedelta(days=1)
    
    # Skip Sundays and non-working days
    while True:
        if next_day.weekday() == 6:  # Sunday
            next_day += timedelta(days=1)
            continue
        if NonWorkingDay.objects.filter(date=next_day).exists():
            next_day += timedelta(days=1)
            continue
        break
    
    return next_day


def reschedule_hearings_for_date(blocked_date):
    """
    Reschedule all hearings on blocked_date.
    
    Logic:
    - If 1-2 hearings: try to fit into next day's open slots
    - If 3+ hearings OR no open slots: cascade all hearings by 1 day
    
    Returns list of rescheduled hearing info.
    """
    if isinstance(blocked_date, str):
        blocked_date = datetime.strptime(blocked_date, "%Y-%m-%d").date()
    
    # Get hearings on this date
    hearings = Hearing.objects.filter(hearing_date=blocked_date).order_by('time')
    hearing_count = hearings.count()
    
    if hearing_count == 0:
        return []
    
    next_day = get_next_working_day(blocked_date)
    rescheduled = []
    
    # Check available slots on next day
    available_slots = [s for s in get_available_slots(next_day) if s["available"]]
    
    # Determine mode: insert vs cascade
    use_insert_mode = hearing_count <= 2 and len(available_slots) >= hearing_count
    
    if use_insert_mode:
        # Insert mode: fit hearings into available slots
        for i, hearing in enumerate(hearings):
            if i < len(available_slots):
                old_date = hearing.hearing_date
                old_time = hearing.time
                
                hearing.hearing_date = next_day
                hearing.time = datetime.strptime(available_slots[i]["time"], "%H:%M").time()
                hearing.hearing_status = "rescheduled"
                hearing.save()
                
                rescheduled.append({
                    "hearing_id": hearing.id,
                    "case_id": hearing.case_id,
                    "old_date": str(old_date),
                    "old_time": str(old_time) if old_time else None,
                    "new_date": str(hearing.hearing_date),
                    "new_time": str(hearing.time),
                    "mode": "insert"
                })
    else:
        # Cascade mode: push all affected dates forward
        # First, collect all dates that need cascading (from blocked_date onwards with hearings)
        cascade_date = blocked_date
        dates_to_process = []
        
        # Find consecutive dates with hearings that need to be pushed
        while True:
            if Hearing.objects.filter(hearing_date=cascade_date).exists():
                dates_to_process.append(cascade_date)
            cascade_date = get_next_working_day(cascade_date)
            
            # Stop if the next working day has no hearings (no more cascading needed)
            # Or if we've processed too many dates (safety limit)
            next_has_hearings = Hearing.objects.filter(hearing_date=cascade_date).exists()
            if not next_has_hearings or len(dates_to_process) > 30:
                break
        
        # Process dates in reverse order to avoid conflicts
        for process_date in reversed(dates_to_process):
            next_working = get_next_working_day(process_date)
            
            for hearing in Hearing.objects.filter(hearing_date=process_date):
                old_date = hearing.hearing_date
                old_time = hearing.time
                
                hearing.hearing_date = next_working
                hearing.hearing_status = "rescheduled"
                hearing.save()
                
                rescheduled.append({
                    "hearing_id": hearing.id,
                    "case_id": hearing.case_id,
                    "old_date": str(old_date),
                    "old_time": str(old_time) if old_time else None,
                    "new_date": str(hearing.hearing_date),
                    "new_time": str(hearing.time) if hearing.time else None,
                    "mode": "cascade"
                })
    
    # Sync rescheduled hearings to Google Calendar
    try:
        from google_calendar.views import sync_hearing_to_google
        for hearing in hearings:
            sync_hearing_to_google(hearing, action="update")
    except Exception as e:
        print(f"[Reschedule] Google Calendar sync error: {e}")
    
    return rescheduled


class MarkNonWorkingDayView(APIView):
    """
    Mark a date as non-working and reschedule affected hearings.
    
    POST /api/non-working-day/
    {
        "date": "2026-01-30",
        "reason": "typhoon",
        "description": "Typhoon Signal #3"
    }
    """
    def post(self, request):
        data = request.data
        date_str = data.get("date")
        reason = data.get("reason", "holiday")
        description = data.get("description", "")
        
        if not date_str:
            return Response(
                {"error": "date is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            date_obj = datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            return Response(
                {"error": "Invalid date format. Use YYYY-MM-DD"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if already marked
        if NonWorkingDay.objects.filter(date=date_obj).exists():
            return Response(
                {"error": "This date is already marked as non-working"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create non-working day record
        non_working = NonWorkingDay.objects.create(
            date=date_obj,
            reason=reason,
            description=description
        )
        
        # Reschedule hearings
        rescheduled = reschedule_hearings_for_date(date_obj)
        
        return Response({
            "success": True,
            "non_working_day": {
                "id": non_working.id,
                "date": str(non_working.date),
                "reason": non_working.reason,
                "reason_display": non_working.get_reason_display(),
                "description": non_working.description
            },
            "rescheduled_count": len(rescheduled),
            "rescheduled_hearings": rescheduled
        }, status=status.HTTP_201_CREATED)


class GetNonWorkingDaysView(APIView):
    """
    Get all non-working days (optionally filtered by month).
    
    GET /api/non-working-days/
    GET /api/non-working-days/?month=2026-01
    """
    def get(self, request):
        month_str = request.query_params.get("month")
        
        queryset = NonWorkingDay.objects.all()
        
        if month_str:
            try:
                year, month = map(int, month_str.split("-"))
                queryset = queryset.filter(date__year=year, date__month=month)
            except ValueError:
                pass
        
        days = []
        for day in queryset:
            days.append({
                "id": day.id,
                "date": str(day.date),
                "reason": day.reason,
                "reason_display": day.get_reason_display(),
                "description": day.description or "",
                "created_at": day.created_at.isoformat()
            })
        
        return Response({
            "non_working_days": days,
            "count": len(days)
        }, status=status.HTTP_200_OK)


class RemoveNonWorkingDayView(APIView):
    """
    Remove a non-working day marker (does NOT restore hearings).
    
    DELETE /api/non-working-day/<date>/
    """
    def delete(self, request, date):
        try:
            date_obj = datetime.strptime(date, "%Y-%m-%d").date()
        except ValueError:
            return Response(
                {"error": "Invalid date format. Use YYYY-MM-DD"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            non_working = NonWorkingDay.objects.get(date=date_obj)
            non_working.delete()
            return Response({
                "success": True,
                "message": f"Non-working day {date} removed"
            }, status=status.HTTP_200_OK)
        except NonWorkingDay.DoesNotExist:
            return Response(
                {"error": "Non-working day not found"},
                status=status.HTTP_404_NOT_FOUND
            )
