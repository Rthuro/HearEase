from django.core.management.base import BaseCommand
from cases.models import CaseType

class Command(BaseCommand):
    help = "Seed the CaseType table with predefined complaint types"

    def handle(self, *args, **options):
        nature_of_complaints = [
            {"label": "Noise Nuisance", "severity": 1, "examples": ["Karaoke past quiet hours", "Loud parties", "Barking dogs"]},
            {"label": "Obstruction", "severity": 1, "examples": ["Blocking driveway or alley", "Improper sidewalk use"]},
            {"label": "Unpaid Debt", "severity": 2, "examples": ["Utang/loan unpaid", "Split-bill disputes"]},
            {"label": "Property Boundary", "severity": 2, "examples": ["Fence encroachment", "Right-of-way access"]},
            {"label": "Minor Property Damage", "severity": 2, "examples": ["Broken plant pots", "Scratched gate"]},
            {"label": "Verbal Abuse", "severity": 2, "examples": ["Name-calling", "Shouting matches"]},
            {"label": "Threats and Scandals (non-deadly)", "severity": 3, "examples": ["Non-specific threats", "Disturbance in public"]},
            {"label": "Simple Trespass to Dwelling (no violence)", "severity": 3, "examples": ["Entered yard without permission"]},
            {"label": "Minor Physical Injuries (no weapon, brief medical attention)", "severity": 3, "examples": ["Pushing/shoving", "Small bruise"]},
            {"label": "Loss of Property (low value, no violence)", "severity": 4, "examples": ["Missing laundry", "Stolen plant"]},
            {"label": "Moderate Property Damage", "severity": 4, "examples": ["Spray paint on wall", "Broken window"]},
            {"label": "Assault (Serious Injuries) / Weapon Involved", "severity": 5, "examples": ["Knife attack", "Fractures, severe wounds"]},
            {"label": "Violence Against Women and their Children (RA 9262)", "severity": 5, "examples": ["Physical/psychological/economic abuse", "Stalking, harassment"]},
            {"label": "Child Abuse / Exploitation (RA 7610)", "severity": 5, "examples": ["Physical/psychological abuse of minors"]},
            {"label": "Illegal Drugs", "severity": 5, "examples": ["Suspected shabu use/sale"]},
        ]

        for complaint in nature_of_complaints:
            case_name = complaint["label"]
            severity = complaint["severity"]
            description = "; ".join(complaint["examples"])

            obj, created = CaseType.objects.get_or_create(
                case_name=case_name,
                defaults={
                    "severity": severity,
                    "description": description
                }
            )

            if created:
                self.stdout.write(self.style.SUCCESS(f"Added: {case_name}"))
            else:
                self.stdout.write(self.style.WARNING(f"Already exists: {case_name}"))

        self.stdout.write(self.style.SUCCESS("CaseType seeding complete!"))
