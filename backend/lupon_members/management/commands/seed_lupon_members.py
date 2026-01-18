from django.core.management.base import BaseCommand
from lupon_members.models import LuponMember, Schedule
from datetime import date


class Command(BaseCommand):
    help = "Seed the LuponMember table with sample Lupon members"

    def handle(self, *args, **options):
        lupon_members = [
            {
                "first_name": "Juan",
                "last_name": "Dela Cruz",
                "middle_name": "Santos",
                "birth_date": date(1975, 3, 15),
                "sex": "Male",
                "contact_number": "09171234567",
                "barangay": "Tetuan",
                "street": "Rizal Street",
                "additional_info": "Lupon Chairman, 20 years experience in mediation",
                "role": "admin",
                "sched": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            },
            {
                "first_name": "Maria",
                "last_name": "Santos",
                "middle_name": "Reyes",
                "birth_date": date(1980, 7, 22),
                "sex": "Female",
                "contact_number": "09181234568",
                "barangay": "Tetuan",
                "street": "Mabini Street",
                "additional_info": "Vice Chairman, specializes in family disputes",
                "role": "admin",
                "sched": ["Monday", "Wednesday", "Friday"],
            },
            {
                "first_name": "Pedro",
                "last_name": "Reyes",
                "middle_name": "Garcia",
                "birth_date": date(1968, 11, 5),
                "sex": "Male",
                "contact_number": "09191234569",
                "barangay": "Tetuan",
                "street": "Bonifacio Street",
                "additional_info": "Senior mediator, retired teacher",
                "role": "staff",
                "sched": ["Tuesday", "Thursday", "Saturday"],
            },
            {
                "first_name": "Ana",
                "last_name": "Garcia",
                "middle_name": "Lopez",
                "birth_date": date(1985, 2, 14),
                "sex": "Female",
                "contact_number": "09201234570",
                "barangay": "Tetuan",
                "street": "Luna Street",
                "additional_info": "Secretary, handles documentation",
                "role": "staff",
                "sched": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            },
            {
                "first_name": "Jose",
                "last_name": "Lopez",
                "middle_name": "Cruz",
                "birth_date": date(1972, 8, 30),
                "sex": "Male",
                "contact_number": "09211234571",
                "barangay": "Tetuan",
                "street": "Aguinaldo Street",
                "additional_info": "Experienced in property disputes",
                "role": "staff",
                "sched": ["Monday", "Wednesday", "Friday", "Saturday"],
            },
            {
                "first_name": "Rosa",
                "last_name": "Cruz",
                "middle_name": "Mendoza",
                "birth_date": date(1978, 5, 18),
                "sex": "Female",
                "contact_number": "09221234572",
                "barangay": "Tetuan",
                "street": "Del Pilar Street",
                "additional_info": "Handles women and children cases",
                "role": "staff",
                "sched": ["Tuesday", "Thursday"],
            },
            {
                "first_name": "Carlos",
                "last_name": "Mendoza",
                "middle_name": "Ramos",
                "birth_date": date(1965, 12, 1),
                "sex": "Male",
                "contact_number": "09231234573",
                "barangay": "Tetuan",
                "street": "Quezon Street",
                "additional_info": "Senior citizen advisor, retired policeman",
                "role": "staff",
                "sched": ["Monday", "Tuesday", "Wednesday"],
            },
            {
                "first_name": "Elena",
                "last_name": "Ramos",
                "middle_name": "Torres",
                "birth_date": date(1982, 9, 25),
                "sex": "Female",
                "contact_number": "09241234574",
                "barangay": "Tetuan",
                "street": "Magsaysay Street",
                "additional_info": "Youth coordinator, handles youth-related cases",
                "role": "staff",
                "sched": ["Wednesday", "Thursday", "Friday", "Saturday"],
            },
            {
                "first_name": "Manuel",
                "last_name": "Torres",
                "middle_name": "Villanueva",
                "birth_date": date(1970, 4, 10),
                "sex": "Male",
                "contact_number": "09251234575",
                "barangay": "Tetuan",
                "street": "Laurel Street",
                "additional_info": "Business dispute specialist, former businessman",
                "role": "staff",
                "sched": ["Monday", "Thursday", "Saturday"],
            },
            {
                "first_name": "Lucia",
                "last_name": "Villanueva",
                "middle_name": "Aquino",
                "birth_date": date(1988, 6, 8),
                "sex": "Female",
                "contact_number": "09261234576",
                "barangay": "Tetuan",
                "street": "Osmena Street",
                "additional_info": "Newest member, legal background",
                "role": "staff",
                "sched": ["Tuesday", "Wednesday", "Friday"],
            },
        ]

        for member_data in lupon_members:
            # Extract schedule before creating member
            schedule_days = member_data.pop("sched", [])

            # Create or get the member
            obj, created = LuponMember.objects.get_or_create(
                first_name=member_data["first_name"],
                last_name=member_data["last_name"],
                defaults=member_data
            )

            if created:
                # Save schedule as JSON field
                obj.sched = schedule_days
                obj.save()

                # Also create Schedule entries for the related model
                for day in schedule_days:
                    Schedule.objects.get_or_create(lupon_member=obj, day=day)

                self.stdout.write(
                    self.style.SUCCESS(f"Added: {obj.first_name} {obj.last_name}")
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f"Already exists: {obj.first_name} {obj.last_name}")
                )

        self.stdout.write(self.style.SUCCESS(f"\nLupon member seeding complete! Total: {LuponMember.objects.count()} members"))
