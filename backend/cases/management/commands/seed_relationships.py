from django.core.management.base import BaseCommand
from ...models import Relationship

class Command(BaseCommand):
    help = "Seeds default Relationship types (Friend, Landowner, etc.)"

    def handle(self, *args, **options):
        relationships = ["Neighbor", "Family", "Coworker", "Stranger", "Ex-Partner", "Tenant/Landlord"]

        for name in relationships:
            obj, created = Relationship.objects.get_or_create(
                relationship=name
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f"Added: {name}"))
            else:
                self.stdout.write(self.style.WARNING(f"Already exists: {name}"))

        self.stdout.write(self.style.SUCCESS("🎉 Relationship seeding complete!"))
