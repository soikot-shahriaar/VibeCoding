import urllib.request
import urllib.parse
import json

base_url = 'http://localhost:8000/'

print("Testing HTTP endpoints on", base_url)

# 1. Test index.html
res = urllib.request.urlopen(base_url)
assert res.status == 200
html = res.read().decode('utf-8')
print('[PASS] index.html loaded (HTTP 200)')

# 2. Test requirements.json
res = urllib.request.urlopen(base_url + 'sample_data/requirements.json')
assert res.status == 200
data = json.loads(res.read().decode('utf-8'))
assert data['tender']['tender_id'] == 'T-2026-0417'
print(f'[PASS] requirements.json loaded ({len(data["requirements"])} requirements)')

# 3. Test 10 sample PDFs
files = [
    '01_financial_proposal.pdf',
    '02_technical_proposal.pdf',
    '03_tin_certificate.pdf',
    '04_vat_certificate.pdf',
    'bank_solvency.pdf',
    'experience_cert (1).pdf',
    'experience_cert.pdf',
    'scan_0042.pdf',
    'trade_license_2025.pdf',
    'trade_license_2026.pdf'
]

for f in files:
    url = base_url + 'sample_data/sample_pdfs/' + urllib.parse.quote(f)
    req = urllib.request.urlopen(url)
    assert req.status == 200
    pdf_bytes = req.read()
    assert len(pdf_bytes) > 0
    print(f'[PASS] {f} fetched via HTTP ({len(pdf_bytes)} bytes)')

# 4. Test assets
assets = [
    'styles/main.css',
    'lib/pdf-lib.min.js',
    'js/i18n.js',
    'js/state.js',
    'js/autoMatcher.js',
    'js/pdfEngine.js',
    'js/ui.js',
    'js/app.js',
    '.nojekyll'
]

for a in assets:
    url = base_url + a
    req = urllib.request.urlopen(url)
    assert req.status == 200
    print(f'[PASS] Asset {a} fetched via HTTP ({len(req.read())} bytes)')

print('\n==================================================')
print('ALL 10 SAMPLE PDFS + ASSETS SERVED CORRECTLY OVER HTTP!')
print('==================================================')
