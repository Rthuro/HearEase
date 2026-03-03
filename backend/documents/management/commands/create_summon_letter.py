from django.core.management.base import BaseCommand
from documents.models import DocumentTemplate

class Command(BaseCommand):
    help = 'Create summon letter template'
    
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
                    <p><strong>Date:</strong> {{ date_filed }}</p>
                    
                    <p>
                        <strong>To:</strong> {{ respondents }}<br>
                        <strong>Address:</strong> {{ respondent_address }}
                    </p>
                    
                    <p><strong>Subject: Summon to Appear for Barangay Hearing</strong></p>
                    
                    <p style="text-indent: 40px; text-align: justify;">
                        You are hereby summoned to appear before the Barangay Lupon Tagapamayapa of Tetuan, 
                        Zamboanga City, in connection with a complaint filed by:
                    </p>
                    
                    <p style="margin-left: 40px;">
                        <strong>Complainant/s:</strong> {{ complainants }}<br>
                        <strong>Nature of Complaint:</strong> {{ nature_of_complaint }}<br>
                        <strong>Case Number:</strong> {{ case_number }}
                    </p>
                    
                    <p><strong>You are required to attend the hearing on:</strong></p>
                    
                    <p style="margin-left: 40px;">
                        <strong>Date:</strong> {{ hearing_date }}<br>
                        <strong>Time:</strong> {{ time }}<br>
                        <strong>Venue:</strong> Barangay Tetuan Hall<br>
                        <strong>Assigned Lupon Member:</strong> {{ lupon_member }}
                    </p>
                    
                    <p style="text-indent: 40px; text-align: justify;">
                        Failure to appear in three (3) consecutive hearings will result in marking the case as a 
                        <strong>No-show</strong>. Non-resolution after six (6) hearings will lead to the issuance 
                        of a <strong>Certification to File in Court</strong>.
                    </p>
                    
                    <p>Please be guided accordingly.</p>
                    
                    <p style="margin-top: 40px;">Sincerely,</p>
                    
                    <div class="signature-section">
                        <p style="margin-top: 60px; border-top: 2px solid #000; width: 250px; text-align: center;">
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
                'name': 'Summon Letter Template',
                'html_content': html_content,
                'css_styles': css_styles,
                'template_type': 'summon',
                'placeholders': ['date_filed', 'respondents', 'respondent_address', 'complainants', 'nature_of_complaint', 'case_number', 'hearing_date', 'time', 'lupon_member', 'punong_barangay']
            }
        )
        
        self.stdout.write(self.style.SUCCESS('Summon letter template created successfully'))