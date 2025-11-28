from django.urls import path, include
from users import views as UserViews
from addresses import views as AddressViews
from lupon_members import views as LuponViews
from cases import views as CaseViews
from hearings import views as HearingViews
from complainants import views as ComplainantsViews
from documents import views as DocumentViews
from respondents import views as RespondentViews

urlpatterns = [
    path("register/", UserViews.RegisterView.as_view(), name="register"),

    path('check-email/', UserViews.CheckEmailView.as_view(), name='check-email'),
    path('find-user/', UserViews.FindUserView.as_view(), name='find-user'),
    path('update-user/<int:pk>/', UserViews.UpdateUserView.as_view(), name='update-user'),

    path('complainants/', ComplainantsViews.ComplainantView.as_view(), name='complainants-list'),
    path('update-complainant/<int:pk>/', ComplainantsViews.updateComplainantView.as_view(), name='update-complainant'),
    path('co-complainant/<int:pk>/', ComplainantsViews.CoComplainantView.as_view(), name='co-complainant'),
    path('get-case-co-complainants/', ComplainantsViews.GetCaseCoComplainantsView.as_view(), name='case-co-complainants-list'),

    path('respondents/', RespondentViews.RespondentView.as_view(), name='respondents'),
    path('co-respondent/<int:pk>/', RespondentViews.CoRespondentView.as_view(), name='co-respondent'),
    path('update-respondent/<int:pk>/', RespondentViews.UpdateRespondentView.as_view(), name='update-respondent'),
    path('get-case-co-respondents/', RespondentViews.GetCaseCoRespondentsView.as_view(), name='case-co-respondents-list'),

    path('login/', UserViews.LoginView.as_view(), name='login'),
    path('barangays/', AddressViews.BarangayListView.as_view(), name='barangay-list'),
    path('streets/', AddressViews.StreetListView.as_view(), name='street-list'),
    path('lupon-members/', LuponViews.LuponMemberView.as_view(), name='lupon-member-list'),

    path('cases/', CaseViews.CaseView.as_view(), name='create-case'),
    path('case-list/', CaseViews.CaseListView.as_view(), name='case-list'),
    path('case-types/', CaseViews.CaseTypeListView.as_view(), name='case-type-list'),
    path('delete-case/', CaseViews.CaseDeleteView.as_view(), name='delete-case'),
    path('update-case/<str:pk>/', CaseViews.UpdateCaseInfoView.as_view(), name='update-case'),
    path('single-case/', CaseViews.SingleCaseView.as_view(), name='single-case'),

    path('settlement-types/', CaseViews.SettlementTypeListView.as_view(), name='settlement-type-list'),
    path('hearings/', HearingViews.HearingView.as_view(), name='all-hearing-list'),
    path('hearing-cases/', HearingViews.HearingCaseView.as_view(), name='hearing-case-list'),

    path('document-templates/', DocumentViews.DocumentTemplateListCreateView.as_view(), name='document-template-list-create'),
    path('templates/<int:pk>/generate/', DocumentViews.GenerateDocumentView.as_view(), name='generate-document'),
    path('generated-documents/', DocumentViews.GeneratedDocumentListView.as_view(), name='generated-documents'),

    path("", include("case_documents.urls")),

] 
