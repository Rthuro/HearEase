from django.core.management.base import BaseCommand
from ...models import SettlementType

class Command(BaseCommand):
    help = "Seeds default Settlement Types (Amicable, Mediation, Conciliation, Arbitration)."

    def handle(self, *args, **options):
        settlement_types = [
            {"settlement_name": "Amicable", "description": "Resolved through mutual agreement without mediation."},
            {"settlement_name": "Mediation", "description": "Facilitated resolution with a Lupon or mediator."},
            {"settlement_name": "Conciliation", "description": "Barangay Captain or Lupon conciliates parties."},
            {"settlement_name": "Arbitration", "description": "Dispute resolved through a formal barangay arbitration process."},
        ]

        for data in settlement_types:
            obj, created = SettlementType.objects.get_or_create(
                settlement_name=data["settlement_name"],
                defaults={"description": data["description"]}
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f"Added: {data['settlement_name']}"))
            else:
                self.stdout.write(self.style.WARNING(f"Already exists: {data['settlement_name']}"))

        self.stdout.write(self.style.SUCCESS("🎉 Settlement types seeding complete!"))
