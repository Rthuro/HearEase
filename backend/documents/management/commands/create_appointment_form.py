from django.core.management.base import BaseCommand
from documents.models import DocumentTemplate

class Command(BaseCommand):
    help = 'Create appointment form'
    
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
                   <div class="document-body-section">
                     <p><strong>Case Number:</strong> <span class="down-border"></span></p>
                     <p><strong>Date of Filling:</strong> <span class="down-border"></span></p>
                   </div>
                    
                    <div class="document-body-section">
                      <p><strong>Complainant Information:</strong></p>
                      <ul style="margin-left: 40px;">
                        <li>Full Name: <span class="down-border"></span></li>
                        <li>Sex: <span class="down-border"></span></li>
                        <li>Birthday: <span class="down-border"></span></li>
                        <li>Address: <span class="down-border"></span></li>
                        <li>Contact Number: <span class="down-border"></span></li>
                      </ul>
                    </div>
                    
                    <div class="document-body-section">
                      <p><strong>Respondent Information:</strong></p>
                      <ul style="margin-left: 40px;">
                        <li>Full Name: <span class="down-border"></span></li>
                        <li>Sex: <span class="down-border"></span></li>
                        <li>Birthday: <span class="down-border"></span></li>
                        <li>Address: <span class="down-border"></span></li>
                        <li>Contact Number: <span class="down-border"></span></li>
                      </ul>
                    </div>
                    
                    <div class="document-body-section">
                      <p><strong>Case Details:</strong></p>
                      <ul style="margin-left: 40px;">
                        <li>Nature of Complaint: <span class="down-border"></span></li>
                        <li>Severity Level: <span class="down-border"></span></li>
                        <li>Short Description (optional): <span class="down-border"></span></li>
                      </ul>
                    </div>
                    
                    <div class="document-body-section" style="border-bottom: 1px solid #000; width: 100%;"></div>
                    
                    <div class="document-body-section">
                      <p><strong>Scheduled Hearing Information:</strong></p>
                      <ul style="margin-left: 40px;">
                        <li>Date of First Hearing: <span class="down-border"></span></li>
                        <li>Time: <span class="down-border"></span></li>
                        <li>Assigned Lupon Member: <span class="down-border"></span></li>
                        <li>Number of Predicted Hearings: <span class="down-border"></span></li>
                      </ul>
                    </div>
                    
                    <div class="document-body-section" 
                    style="margin-top: 60px;">
                      <p><strong>Signature of Barangay Staff:</strong> <span class="down-border"></span></p>
                      <p><strong>Date:</strong> <span class="down-border"></span></p>
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

            .document-body{
            display: flex;
            flex-direction: column;
            gap:12px;
            }

            .document-body .document-body-section p{
                margin: -4px 0;
            }

            .document-body .down-border{
                border-bottom: 1px solid #000;
                width: 150px;
                display: inline-block;
            }

            @media print {
                .document-container {
                    box-shadow: none;
                    border: none;
                }
            }
        '''
        
        DocumentTemplate.objects.update_or_create(
            template_type='appointment',
            defaults={
                'name': 'Appointment Form',
                'html_content': html_content,
                'css_styles': css_styles
            }
        )

        self.stdout.write(self.style.SUCCESS('Appointment form created successfully'))