from django.core.management.base import BaseCommand
from documents.models import DocumentTemplate

class Command(BaseCommand):
    help = 'Create Case Report Summary template'

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
                
                <h3 style="text-align: center; text-transform: uppercase; margin-bottom: 20px;">Case Report Summary</h3>

                <div class="document-body">
                    <div class="info-grid">
                        <p><strong>Case Number:</strong> <span class="down-border">{{ case_number }}</span></p>
                        <p><strong>Date Filed:</strong> <span class="down-border">{{ date_filed }}</span></p>
                    </div>

                    <div class="document-section">
                        <p><strong>Nature of Complaint:</strong> <span class="down-border">{{ case_type }}</span></p>
                        <p><strong>Severity Level:</strong> <span class="down-border">{{ severity }}</span></p>
                    </div>

                    <div class="parties-section" style="margin-top: 20px;">
                        <div style="display: flex; justify-content: space-between;">
                            <div style="width: 45%;">
                                <p><strong>Complainant/s:</strong></p>
                                <p class="list-area">{{ complainants }}</p>
                            </div>
                            <div style="width: 10%; text-align: center; align-self: center;"><strong>VS.</strong></div>
                            <div style="width: 45%;">
                                <p><strong>Respondent/s:</strong></p>
                                <p class="list-area">{{ respondents }}</p>
                            </div>
                        </div>
                    </div>

                    <div class="document-section" style="margin-top: 25px;">
                        <p><strong>Statement of Complaint / Brief Description:</strong></p>
                        <div style="border: 1px solid #ccc; padding: 10px; min-height: 100px; font-style: italic;">
                            {{ description }}
                        </div>
                    </div>

                    <div class="document-section" style="margin-top: 20px;">
                        <p><strong>Case Status:</strong> <span class="down-border" style="text-transform: uppercase; font-weight: bold;">{{ status }}</span></p>
                        <p><strong>Settlement Type:</strong> <span class="down-border">{{ settlement_type}}</span></p>
                        <p><strong>Resolution Date:</strong> <span class="down-border">{{ resolution_date }}</span></p>
                    </div>

                    <div class="document-section" style="margin-top: 20px;">
                        <p><strong>Final Remarks:</strong></p>
                        <p class="down-border" style="min-height: 40px;">{{ remarks }}</p>
                    </div>

                    <div class="signature-section" style="margin-top: 60px; display: flex; justify-content: space-between; text-align: center;">
                        <div style="width: 40%;">
                            <p class="down-border"><strong>{{ secretary_name }}</strong></p>
                            <p style="font-size: 10pt;">Lupon Secretary</p>
                        </div>
                        <div style="width: 40%;">
                            <p class="down-border"><strong>{{ punong_barangay }}</strong></p>
                            <p style="font-size: 10pt;">Punong Barangay / Lupon Chairman</p>
                        </div>
                    </div>
                </div>
                
            </div>
        '''
        
        css_styles = '''
            *{
                font-family: "Arial", Sans-Serif;
                box-sizing: border-box;
            }
            .document-container {
                width: 8.5in;
                min-height: 11in;
                padding: 0.8in;
                margin: 0 auto;
                background: white;
                font-size: 11pt;
                line-height: 1.5;
                border: 1px solid #eee;
                display: flex;
                flex-direction: column;
            }

            .document-header {
                margin-bottom: 20px;
                padding-bottom: 10px;
                border-bottom: 2px solid #000;
            }

            .info-grid {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
            }

            .document-section {
                margin-bottom: 15px;
            }

            .down-border {
                display: inline-block;
                min-width: 150px;
                padding: 0 5px;
                border-bottom: 1px solid #000;
            }

            .list-area {
                border-bottom: 1px solid #000;
                min-height: 25px;
                font-weight: bold;
            }

            @media print {
                .document-container {
                    border: none;
                    margin: 0;
                    padding: 0.5in;
                }
                body { background: white; }
            }
        '''
        
        DocumentTemplate.objects.update_or_create(
            defaults={
                'name': 'Case Report Summary',
                'html_content': html_content,
                'css_styles': css_styles,
                'template_type': 'case_report',
                'placeholders': ['case_number', 'date_filed', 'case_type', 'severity', 'complainants', 'respondents', 'description', 'status', 'settlement_type', 'resolution_date', 'remarks', 'secretary_name', 'punong_barangay']
            }
        )

        self.stdout.write(self.style.SUCCESS('Case Report Summary Template created successfully'))