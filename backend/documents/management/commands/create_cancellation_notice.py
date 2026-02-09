from django.core.management.base import BaseCommand
from documents.models import DocumentTemplate

class Command(BaseCommand):
    help = 'Create cancellation notice'

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
                      <p><strong>Date:</strong> {{ date }}</p>
                      <p><strong>Case Number:</strong> {{ case_number }}</p>
                    </div>
                    
                    <p style="margin: 30px 0;">
                        <strong>To:</strong> <br>
                        {{ punong_barangay }}<br>
                        Punong Barangay <br>
                        Barangay Tetuan <br>
                        Zamboanga City 
                    </p>
                    
                    <p style="margin: 20px 0;">
                      <strong>Subject:</strong> Request for Hearing Cancellation – {{ case_number }}
                    </p>
                    
                    <p>
                      Dear {{ punong_barangay }},
                    </p>
                    
                    <p>
                       I, <strong>{{ lupon_secretary }}</strong>, in my capacity as the Lupon Secretary of Barangay Tetuan, 
                       respectfully submit this letter requesting the cancellation of the scheduled hearing for <strong>Case No. {{ case_number }}</strong>, 
                       involving <strong>{{ complainants }}</strong> and <strong>{{ respondents }}</strong>, originally set for <strong>{{ next_hearing_date }}</strong>.
                    </p>
                    
                    <p>
                      The request for cancellation has been made by [
                      <span>
                        <input type="checkbox" id="complainant" name="complainant" value="complainant"
                         {% if complainant %}checked{% endif %}>
                        <label for="complainant">Complainant</label>
                      </span> 
                      <span>
                        <input type="checkbox" id="respondent" name="respondent" value="respondent"
                         {% if respondent %}checked{% endif %}>
                        <label for="respondent">Respondent</label>
                      </span>] 
                      due to the following reason: <br>
                      
                    </p>
                    
                    <p>
                     <strong>{{ cancellation_reason }}</strong>
                    </p>
                    
                    <p>
                     Supporting documents, if required, will be submitted along with this request for your review.
                    </p>
                    <p>
                     This cancellation request is made in accordance with the barangay procedures, and we acknowledge 
                     that this will be considered as the <strong>{{ cancellation_number }}</strong> cancellation for the case.
                    </p>
                    <p style="margin-top: 20px;">
                     Thank you for your time and consideration. I await your decision on this matter.
                    </p>
                    <p style="margin-top: 40px;">
                     Respectfully,
                    </p>
                    
                    <p  style="width: 250px; margin-top:20px; text-align: center;">
                      <strong>{{ lupon_secretary }}</strong><br>
                      Lupon Secretary
                      Barangay Tetuan, Zamboanga City
                    </p>
                    
                    
                    <div style="border-top: 1px solid #000; width: 100%; margin: 20px 0;"></div>
                    
                    <p style="margin-top:20px"><strong>Approved / Disapproved by:</strong></p>
                    
                    
                    <div class="signature-section">
                        <p  style="text-align: center; margin-top:20px;">
                          <strong>Punong Barangay, {{ punong_barangay }}</strong><br>
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
            template_type='cancellation',
            defaults={
                'name': 'Cancellation Notice',
                'html_content': html_content,
                'css_styles': css_styles
            }
        )

        self.stdout.write(self.style.SUCCESS('Cancellation Notice created successfully'))