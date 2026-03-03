from django.core.management.base import BaseCommand
from documents.models import DocumentTemplate

class Command(BaseCommand):
    help = 'Create court certification template'
    
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
                
                <p style="margin:0px auto;"><strong>CERTIFICATION TO FILE ACTION IN COURT</strong></p>
                
                <div class="document-body">
                    <p style="margin-top: 34px;">TO WHOM IT MAY CONCERN:</p>
                    
                    <p style="margin: 12px 0;">This is to certify that:</p>
                    
                    <div class="document-body-section">
                      <p><strong>Complainant/s:</strong> {{ complainants }}</p>
                      <p><strong>Respondent/s:</strong> {{ respondents }}</p>
                      <p><strong>Nature of Complaint:</strong> {{ nature }}</p>
                      <p><strong>Case Number:</strong> {{ case_number }}</p>
                    </div>
                    
                    
                    <p style="text-indent: 40px; text-align: justify; margin-top: 30px;">
                        The aforementioned case has undergone six (6) barangay hearings but remains <strong>unresolved</strong>.
                    </p>
                    <p>
                      Pursuant to Section 412 of the Local Government Code, you are now allowed to file the case in court.
                    </p>
                    <p>
                     Issued this <span class="down-border">{{ month }}</span> day of <span class="down-border">{{ day }}</span>, {{ year }} at Barangay Tetuan, Zamboanga City.
                    </p>
                    
                    <div style="border-top: 1px solid #000; width: 100%; margin-top: 40px;"></div>
                    
                    <div class="signature-section">
                        <p  style="border-top: 2px solid #000; width: 250px; text-align: center;">
                          <strong>Punong Barangay</strong><br>
                          Barangay Tetuan, Zamboanga City
                        </p>
                        <p style="border-top: 2px solid #000; width: 250px; text-align: center;">
                            <strong>Lupon Secretary</strong><br>
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
                display: flex;
                flex-direction: column;
            }

            .document-header {
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 2px solid #000;
            }

            .document-body p {
                margin: 10px 0;
            }

            .document-body .document-body-section p{
                margin: -4px 0;
            }

            .document-body .down-border{
                padding: 0px 4px;
                border-bottom: 1px solid #000;
            }

            .signature-section {
                margin-top: 100px;
                display: flex;
                justify-content: space-around;
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
                'name': 'Court Certification Template',
                'html_content': html_content,
                'css_styles': css_styles,
                'template_type': 'court',
                'placeholders': ['complainants', 'respondents', 'nature', 'case_number', 'month', 'day', 'year']
            }
        )

        self.stdout.write(self.style.SUCCESS('Court Certification Template created successfully'))