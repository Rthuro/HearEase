from django.core.management.base import BaseCommand
from documents.models import DocumentTemplate

class Command(BaseCommand):
    help = 'Create no-show notice'
    
    def handle(self, *args, **kwargs):
        html_content = '''
             <div class="document-container">
                <div class="document-header">
                    <p style="text-align: center; margin: 0; line-height: 1.5;">
                        <strong>Republic of the Philippines</strong><br>
                        <strong>City of Zamboanga</strong><br>
                        <strong>Barangay Tetuan</strong><br>
                        <strong>OFFICE OF THE LUPONG TAGAPAMAYAPA</strong>
                    </p>
                </div>
                
                <div class="document-body">
                    <p><strong>Date:</strong> {{ date }}</p>
                    <p><strong>Case Number:</strong> {{ case_number }}</p>
                    <p><strong>To:</strong> {{ name }}</p>
                    <p><strong>Address:</strong> {{ address }}</p>
                    
                    <p style="margin-top: 12px; margin-bottom: 24px;"><strong>Subject: Notice of No-Show Status</strong></p>
                    
                    <p style="text-indent: 40px; text-align: justify;">
                        This letter is to inform you that you have failed to attend three (3) consecutive hearings scheduled by the Barangay Lupon Tagapamayapa.
                    </p>
                    <p style="text-indent: 40px; text-align: justify;">
                       In line with Barangay Justice System protocols, your case is now marked as a <strong>No-show</strong>, and may be archived or escalated depending on the Barangay’s discretion.</p>
                    
                
                    
                    <p style="margin-top: 40px;">Sincerely,</p>
                    
                    <div class="signature-section">
                        <p style="border-top: 2px solid #000; width: 250px; text-align: center;">
                            <strong>{{ punong_barangay }}</strong><br>
                            Punong Barangay<br>
                            Barangay Tetuan, Zamboanga City
                        </p>
                    </div>
                </div>
            </div>
        '''
        
        css_styles = '''
            *{
                font-family: "Arial", Sans-Serif;
                box-sizing: border-box;
                margin:0;
                padding:0;
            }
            .document-container {
                width: 8.5in;
                min-height: 11in;
                padding: 1in;
                margin: 0 auto;
                background: white;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
                font-size: 12pt;
                line-height: 1.6;
                border: 1px solid #000;
            }

            .document-header {
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 2px solid #000;
            }

            .document-body p {
                margin: 10px 0;
            }

            .signature-section {
                margin-top: 40px;
                display: flex;
                justify-content: flex-start;
            }

            @media print {
                .document-container {
                    box-shadow: none;
                    border: none;
                }
            }
        '''
        
        DocumentTemplate.objects.update_or_create(
            defaults={
                'name': 'No-Show Notice',
                'html_content': html_content,
                'css_styles': css_styles,
                'template_type': 'no-show',
                'placeholders': ['date', 'case_number', 'name', 'address', 'punong_barangay']
            }
        )

        self.stdout.write(self.style.SUCCESS('No-Show Notice created successfully'))