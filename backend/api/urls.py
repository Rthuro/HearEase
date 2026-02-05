from django.urls import path, include
from users import views as UserViews
from addresses import views as AddressViews
from lupon_members import views as LuponViews
from cases import views as CaseViews
from hearings import views as HearingViews
from documents import views as DocumentViews
from AIModel import views as AIModelViews
from case_persons import views as CasePersonViews
from case_organizations import views as CaseOrganizationViews

urlpatterns = [
    path("test-email/", CaseViews.TestEmailView.as_view(), name="test-email"),
    
    path("register/", UserViews.RegisterView.as_view(), name="register"),
    path('auth/google/', UserViews.GoogleLoginView.as_view(), name='google-login'),

    path('auth/send-otp/', UserViews.SendOTPView.as_view()),
    path('auth/verify-otp/', UserViews.VerifyOTPView.as_view()),
    path('verify-identity/', UserViews.VerifyIdentityView.as_view(), name='verify-identity'),

    path('user/notifications/', UserViews.UserNotificationSettingsView.as_view(), name='user-notification-settings'),

    path('check-email/', UserViews.CheckEmailView.as_view(), name='check-email'),
    path('find-user/', UserViews.FindUserView.as_view(), name='find-user'),
    path('update-user/<int:pk>/', UserViews.UpdateUserView.as_view(), name='update-user'),
    path('admins/', UserViews.AdminView.as_view(), name='admins'),

    path('case-persons/', CasePersonViews.CasePersonView.as_view(), name='case-persons'),
    path('case-person/<str:email>/', CasePersonViews.SingleCasePersonView.as_view(), name='case-person-detail'),

    path('login/', UserViews.LoginView.as_view(), name='login'),
    path('barangays/', AddressViews.BarangayListView.as_view(), name='barangay-list'),
    path('streets/', AddressViews.StreetListView.as_view(), name='street-list'),
    path('lupon-members/', LuponViews.LuponMemberView.as_view(), name='lupon-member-list'),
    path('lupon-member/', LuponViews.LuponPageView.as_view(), name='lupon-member-detail'),
    path('update-lupon/<int:pk>/', LuponViews.UpdateLuponView.as_view(), name='update-lupon'),
    path('delete-lupon/', LuponViews.LuponDeleteView.as_view(), name='delete-lupon'),

    path('sync-user-cases/', CaseViews.SyncCasesView.as_view(), name='sync-user-cases'),
    path('cases/', CaseViews.CaseView.as_view(), name='create-case'),
    path('case-list/', CaseViews.CaseListView.as_view(), name='case-list'),
    path('case-types/', CaseViews.CaseTypeListView.as_view(), name='case-type-list'),
    path('delete-case/', CaseViews.CaseDeleteView.as_view(), name='delete-case'),
    path('update-case/<str:pk>/', CaseViews.UpdateCaseInfoView.as_view(), name='update-case'),
    path('single-case/', CaseViews.SingleCaseView.as_view(), name='single-case'),
    path('case-priority/', CaseViews.CasePriorityView.as_view(), name='case-priority'),

    path('relationship-list/', CaseViews.RelationshipListView.as_view(), name='relationship-list'),
    path('settlement-types/', CaseViews.SettlementTypeListView.as_view(), name='settlement-type-list'),

    path('hearings/', HearingViews.HearingView.as_view(), name='all-hearing-list'),
    path('hearing-cases/', HearingViews.HearingCaseView.as_view(), name='hearing-case-list'),
    path('update-hearings/<str:pk>/', HearingViews.SetCaseHearingsView.as_view(), name='update-hearings'),
    path('update-single-hearing/<int:pk>/', HearingViews.UpdateHearingView.as_view(), name='update-hearing'),
    path('hearing-progress-update/<str:pk>/', CaseViews.UpdateHearingProgressView.as_view(), name='hearing-progress-update'),
    
    # Scheduling endpoints
    path('check-time-conflict/', HearingViews.CheckTimeConflictView.as_view(), name='check-time-conflict'),
    path('optimal-slot/', HearingViews.GetOptimalSlotView.as_view(), name='optimal-slot'),
    
    # Advanced scheduling & analytics (Phase 3)
    path('calendar-heatmap/', HearingViews.CalendarHeatMapView.as_view(), name='calendar-heatmap'),
    path('lupon-workload/', HearingViews.LuponWorkloadView.as_view(), name='lupon-workload'),
    path('early-warning/', HearingViews.EarlyWarningView.as_view(), name='early-warning'),
    path('lupon-match/', HearingViews.LuponCaseMatchingView.as_view(), name='lupon-match'),
    
    # Non-working day management
    path('non-working-day/', HearingViews.MarkNonWorkingDayView.as_view(), name='mark-non-working-day'),
    path('non-working-days/', HearingViews.GetNonWorkingDaysView.as_view(), name='get-non-working-days'),
    path('non-working-day/<str:date>/', HearingViews.RemoveNonWorkingDayView.as_view(), name='remove-non-working-day'),

    path('document-templates/', DocumentViews.DocumentTemplateListCreateView.as_view(), name='document-template-list-create'),
    path('templates/<int:pk>/generate/', DocumentViews.GenerateDocumentView.as_view(), name='generate-document'),
    path('generated-documents/', DocumentViews.GeneratedDocumentListView.as_view(), name='generated-documents'),

    path('reports/', CaseViews.ReportView.as_view(), name='reports'),

    path("", include("case_documents.urls")),

    # AI Model Endpoints
    path('predict-case/', AIModelViews.PredictCaseView.as_view(), name='predict-case'),
    path('model-info/', AIModelViews.ModelInfoView.as_view(), name='model-info'),
    path('trigger-retrain/', AIModelViews.TriggerRetrainView.as_view(), name='trigger-retrain'),
    path('predict-settlement/', AIModelViews.SettlementPredictionView.as_view(), name='predict-settlement'),
    path('training-status/', AIModelViews.TrainingStatusView.as_view(), name='training-status'),
    path('retrain-config/', AIModelViews.UpdateRetrainConfigView.as_view(), name='retrain-config'),

    # Google Calendar Integration
    path('google-calendar/', include('google_calendar.urls')),

]


