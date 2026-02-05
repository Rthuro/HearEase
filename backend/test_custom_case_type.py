"""
Test script to check how the AI model handles unknown/custom case types
"""

import os
import sys
sys.path.insert(0, '.')
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hearease_main.settings')

import django
django.setup()

from AIModel.predictor import predict_case_outcomes, get_trained_case_types, get_model_info

def main():
    print('=' * 60)
    print('AI MODEL TEST: Custom/Unknown Case Types')
    print('=' * 60)

    # Get trained case types
    trained_types = get_trained_case_types()
    print(f'\n1. TRAINED CASE TYPES ({len(trained_types) if trained_types else 0} total):')
    if trained_types:
        for t in trained_types[:5]:
            print(f'   - {t}')
        if len(trained_types) > 5:
            print(f'   ... and {len(trained_types) - 5} more')

    # Test 1: Known case type
    print('\n2. TEST WITH KNOWN CASE TYPE (Grave Threats):')
    result1 = predict_case_outcomes(
        case_type='Grave Threats',
        severity=2,
        relationship='Neighbor',
        num_complainants=1,
        num_respondents=1
    )
    if result1['success']:
        for settlement, pred in result1['predictions'].items():
            print(f'   {settlement}: {pred["predicted_hearings"]} hearings, {pred["predicted_days"]} days')
    else:
        print(f'   Error: {result1.get("error")}')

    # Test 2: Unknown/Custom case type
    print('\n3. TEST WITH UNKNOWN CASE TYPE (Property Dispute - Custom):')
    result2 = predict_case_outcomes(
        case_type='Property Dispute',
        severity=2,
        relationship='Neighbor',
        num_complainants=1,
        num_respondents=1
    )
    if result2['success']:
        for settlement, pred in result2['predictions'].items():
            print(f'   {settlement}: {pred["predicted_hearings"]} hearings, {pred["predicted_days"]} days')
    else:
        print(f'   Error: {result2.get("error")}')

    # Test 3: Completely random case type
    print('\n4. TEST WITH COMPLETELY NEW CASE TYPE (XYZ Random Issue):')
    result3 = predict_case_outcomes(
        case_type='XYZ Random Issue',
        severity=3,
        relationship='Family',
        num_complainants=2,
        num_respondents=1
    )
    if result3['success']:
        for settlement, pred in result3['predictions'].items():
            print(f'   {settlement}: {pred["predicted_hearings"]} hearings, {pred["predicted_days"]} days')
    else:
        print(f'   Error: {result3.get("error")}')

    print('\n5. ANALYSIS:')
    print('   When case_type is unknown, the encoder zeros out that feature.')
    print('   The model still makes predictions based on:')
    print('   - Severity, Relationship, Party counts (these are always known)')
    print('   - Settlement type, Lockdown status, Temporal features')
    print('   - Derived features: Parties_Total, Party_Ratio, Case_Complexity')
    print('')
    print('   Accuracy impact: Model loses case_type signal, predictions are')
    print('   based only on other features. Less accurate but still reasonable.')

if __name__ == '__main__':
    main()
