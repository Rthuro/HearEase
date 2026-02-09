from django.core.management.base import BaseCommand
from documents.models import DocumentTemplate

class Command(BaseCommand):
    help = 'Create monitoring sheet'

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
                      <p><strong>Case Number:</strong> <span class="down-border">{{ case_number }}</span></p>
                      <p><strong>Complainant/s:</strong> <span class="down-border">{{ complainants }}</span></p>
                      <p><strong>Respondent/s:</strong> <span class="down-border">{{ respondents }}</span></p>
                      <p><strong>Lupon Member Assigned:</strong> <span class="down-border">{{ lupon_member }}</span></p>
                      <p><strong>Predicted Hearings:</strong><span class="down-border">{{ predicted_hearings }}</span></p>
                    </div>
                    
                    <table>
                        <thead>
                          <tr>
                            <th>Hearing #</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Status</th>
                            <th>Remarks</th>
                          </tr>
                        </thead>
                        <tbody>
                          {% if hearings %}
                              {% for hearing in hearings %}
                                  <tr>
                                      <td>{{ forloop.counter }}</td>
                                      <td>{{ hearing.date }}</td>
                                      <td>{{ hearing.time }}</td>
                                      <td>{{ hearing.status }}</td>
                                      <td>{{ hearing.remarks }}</td>
                                  </tr>
                              {% endfor %}
                          {% else %}
                              <tr>
                                  <td colspan="5" style="text-align:center;">No hearings recorded</td>
                              </tr>
                          {% endif %}
                        </tbody>
                    </table>
                    
                    <div style="margin-top: 30px;">
                      <input type="checkbox" id="resolved" name="resolved" value="resolved" 
                       {% if resolved %}checked{% endif %}>
                      <label for="resolved">Case Resolved</label>
                    </div>
                    <div>
                      <input type="checkbox" id="escalated" name="escalated" value="escalated"
                       {% if escalated %}checked{% endif %}>
                      <label for="escalated">Escalated to court</label>
                    </div>
                    <div>
                      <input type="checkbox" id="cancelled" name="cancelled" value="cancelled"
                       {% if cancelled %}checked{% endif %}>
                      <label for="cancelled">Case Cancelled</label>
                    </div>
                    <div>
                      <input type="checkbox" id="rejected" name="rejected" value="rejected"
                       {% if rejected %}checked{% endif %}>
                      <label for="rejected">Case Rejected</label>
                    </div>
                    
                    <p>Remarks:<span class="down-border">{{remarks}}</span></p>
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

            table {
            width:100%;
            letter-spacing: 1px;
            margin-top:34px;
            }

            table, th, td {
                border: 1px solid black;
                border-collapse: collapse;
            }

            th, td {
            padding: 4px 0;
            }

            table thead tr th{
            font-weight: normal;
            }

            .document-body .document-body-section p{
                margin: -4px 0;
            }

            .document-body .down-border{
                padding: 0px 4px;
                border-bottom: 1px solid #000;
            }



            @media print {
                .document-container {
                    box-shadow: none;
                    border: none;
                }
            }
        '''
        
        DocumentTemplate.objects.update_or_create(
            template_type='monitoring',
            defaults={
                'name': 'Monitoring Sheet',
                'html_content': html_content,
                'css_styles': css_styles
            }
        )

        self.stdout.write(self.style.SUCCESS('Monitoring Sheet created successfully'))