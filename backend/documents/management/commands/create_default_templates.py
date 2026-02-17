from django.core.management.base import BaseCommand, CommandError
from django.core.management import call_command

class Command(BaseCommand):
    help = "Create all default document templates"

    def handle(self, *args, **options):
        try:
            self.stdout.write(self.style.NOTICE("Creating all default templates..."))

            # Call each individual command
            call_command("create_appointment_form")
            self.stdout.write(self.style.SUCCESS("✅ Appointment form template created."))

            call_command("create_cancellation_notice")
            self.stdout.write(self.style.SUCCESS("✅ Cancellation notice template created."))

            call_command("create_court_certification")
            self.stdout.write(self.style.SUCCESS("✅ Court certification template created."))

            call_command("create_monitoring_sheet")
            self.stdout.write(self.style.SUCCESS("✅ Case monitoring sheet template created."))

            call_command("create_no_show_notice")
            self.stdout.write(self.style.SUCCESS("✅ No-show notice template created."))

            call_command("create_summon_letter")
            self.stdout.write(self.style.SUCCESS("✅ Summon letter template created."))

            call_command("create_case_report")
            self.stdout.write(self.style.SUCCESS("✅ Case report template created."))


            self.stdout.write(self.style.SUCCESS("\n🎉 All default templates created successfully!"))

        except CommandError as e:
            self.stderr.write(self.style.ERROR(f"Error: {e}"))
