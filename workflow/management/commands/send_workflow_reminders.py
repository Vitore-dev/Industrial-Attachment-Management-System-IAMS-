from django.core.management.base import BaseCommand

from workflow.services import dispatch_workflow_reminders


class Command(BaseCommand):
    help = 'Send Release 2 workflow reminders to students and supervisors.'

    def handle(self, *args, **options):
        summary = dispatch_workflow_reminders()
        self.stdout.write(self.style.SUCCESS('Workflow reminders processed.'))
        self.stdout.write(str(summary))
