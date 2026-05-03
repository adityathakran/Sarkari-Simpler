/**
 * Simple mock server for local development without Cloudflare credentials
 * This simulates the Worker API for demo purposes - EXPANDED VERSION
 */

const http = require('http');

const PORT = 8787;

// Mock scheme data - EXPANDED with 15 schemes for different occupations
const schemes = {
    'farmer': {
        name: 'PM-Kisan',
        relevance: 0.95,
        keyPoints: [
            '₹6,000 per year direct income support',
            'For all landholding farmers',
            'Paid in three equal installments'
        ]
    },
    'housing': {
        name: 'PMAY-Gramin',
        relevance: 0.92,
        keyPoints: [
            '₹1.20 lakh for pucca house construction',
            'For homeless and kutcha house families',
            'Selected by Gram Sabha'
        ]
    },
    'health': {
        name: 'Ayushman Bharat',
        relevance: 0.90,
        keyPoints: [
            '₹5 lakh health insurance per family',
            'Cashless treatment at empanelled hospitals',
            'For families identified via SECC 2011'
        ]
    },
    'employment': {
        name: 'MGNREGA',
        relevance: 0.93,
        keyPoints: [
            '100 days guaranteed employment per year',
            'For rural households willing to do manual work',
            'Equal wages for men and women'
        ]
    },
    'food': {
        name: 'PM-GKAY',
        relevance: 0.88,
        keyPoints: [
            '5 kg free foodgrains per person per month',
            'For all NFSA ration cardholders',
            'In addition to regular subsidized ration'
        ]
    },
    'business': {
        name: 'PM Mudra Yojana',
        relevance: 0.91,
        keyPoints: [
            'Loans up to ₹10 lakh for micro-enterprises',
            'No collateral required',
            'For small businesses, vendors, artisans'
        ]
    },
    'women': {
        name: 'Stand Up India',
        relevance: 0.89,
        keyPoints: [
            '₹10 lakh to ₹1 crore loans for women entrepreneurs',
            'For SC/ST and women beneficiaries',
            'Manufacturing, services or trading sector'
        ]
    },
    'education': {
        name: 'PM Scholarships',
        relevance: 0.87,
        keyPoints: [
            'Scholarships for children of police/armed forces',
            'Up to ₹3,000 per month for professional courses',
            'Merit-based selection'
        ]
    },
    'artisan': {
        name: 'PM Vishwakarma',
        relevance: 0.90,
        keyPoints: [
            'Financial support for traditional artisans',
            'Skill training and toolkit incentive',
            'Collateral-free loans up to ₹3 lakh'
        ]
    },
    'maternity': {
        name: 'PM Matru Vandana Yojana',
        relevance: 0.92,
        keyPoints: [
            '₹5,000 cash benefit for pregnant women',
            'For first living child',
            'Direct bank transfer in installments'
        ]
    },
    'pension': {
        name: 'PM Shram Yogi Maandhan',
        relevance: 0.86,
        keyPoints: [
            '₹3,000 monthly pension after 60 years',
            'For unorganized workers earning ≤ ₹15,000/month',
            'Contribution based on age'
        ]
    },
    'construction': {
        name: 'Building Workers Welfare',
        relevance: 0.88,
        keyPoints: [
            'Financial assistance for registered construction workers',
            'Education, medical, housing support',
            'State-specific benefits'
        ]
    },
    'street_vendor': {
        name: 'PM SVANidhi',
        relevance: 0.89,
        keyPoints: [
            '₹10,000 working capital loan for street vendors',
            'Low interest with subsidy on timely repayment',
            'Digital transaction incentives'
        ]
    },
    'girl_child': {
        name: 'Sukanya Samriddhi Yojana',
        relevance: 0.85,
        keyPoints: [
            'Savings scheme for girl child (0-10 years)',
            'High interest rate (currently ~8%)',
            'Tax benefits under Section 80C'
        ]
    },
    'lpg': {
        name: 'PM Ujjwala Yojana',
        relevance: 0.87,
        keyPoints: [
            'Free LPG connection for BPL families',
            'Support for deposit-free connection',
            'Focuses on women beneficiaries'
        ]
    }
};

// Mock responses - Intelligence Engine (Keyword Scoring)
function getMockResponse(query) {
    const lowerQuery = query.toLowerCase();
    const isEnglish = lowerQuery.match(/[a-z]/i) && !lowerQuery.match(/[\u0900-\u0D7F]/);
    
    // Comprehensive Keyword Map for ALL 15 Categories
    const keywordMap = {
        'farmer': ['farmer', 'kisan', 'agriculture', 'kheti', 'किसान', 'खेती', 'land'],
        'housing': ['house', 'home', 'pmay', 'awwas', 'घर', 'आवास', 'मकान'],
        'health': ['health', 'hospital', 'medicine', 'ayushman', 'इलाज', 'अस्पताल', 'बीमारी'],
        'employment': ['job', 'work', 'employment', 'mgnrega', 'काम', 'रोजगार', 'मजदूर'],
        'food': ['ration', 'food', 'grain', 'wheat', 'rice', 'राशन', 'अनाज', 'खाना'],
        'business': ['business', 'loan', 'shop', 'startup', 'व्यापार', 'लोन', 'दुकान'],
        'women': ['women', 'lady', 'female', 'girl', 'महिला', 'स्त्री', 'बेटी'],
        'education': ['student', 'study', 'school', 'college', 'scholarship', 'पढ़ाई', 'छात्र'],
        'artisan': ['artisan', 'craft', 'vishwakarma', 'weaver', 'कारीगर', 'बढ़ई', 'लोहार'],
        'maternity': ['pregnant', 'maternity', 'baby', 'delivery', 'गर्भवती', 'मातृत्व'],
        'pension': ['pension', 'old', 'senior', 'elderly', '60', 'पेंशन', 'बुजुर्ग'],
        'construction': ['construction', 'building', 'labor', 'मजदूर', 'निर्माण', 'मिस्त्री'],
        'street_vendor': ['vendor', 'street', 'cart', 'thela', 'ठेला', 'पटरी', 'फेरीवाला'],
        'girl_child': ['girl', 'daughter', 'sukanya', 'लड़की', 'बेटी', 'कन्या'],
        'lpg': ['gas', 'lpg', 'cylinder', 'ujjwala', 'गैस', 'चूल्हा', 'सिलेंडर']
    };

    let scores = [];
    
    // Score each category based on keyword matches
    for (const [key, keywords] of Object.entries(keywordMap)) {
        let score = 0;
        keywords.forEach(kw => {
            if (lowerQuery.includes(kw)) score += 1;
        });
        if (score > 0) scores.push({ key, score });
    }

    // Sort categories by score (highest relevance first)
    scores.sort((a, b) => b.score - a.score);

    let relevantSchemes = [];
    let topKeys = scores.slice(0, 3).map(s => s.key);
    
    if (topKeys.length > 0) {
        topKeys.forEach(key => relevantSchemes.push(schemes[key]));
    } else {
        // Fallback to defaults only if NO keywords match
        relevantSchemes = [schemes.farmer, schemes.housing, schemes.health, schemes.employment];
    }

    // Construct dynamic, context-aware answer
    let answer = "";
    if (topKeys.length > 0) {
        const primary = schemes[topKeys[0]].name;
        if (isEnglish) {
            answer = `Based on your query, the ${primary} scheme seems most suitable for you. We also found ${relevantSchemes.length} other relevant benefits.`;
        } else {
            answer = `आपकी जानकारी के आधार पर, ${primary} योजना आपके लिए सबसे उपयुक्त है। हमें आपके लिए ${relevantSchemes.length} अन्य महत्वपूर्ण योजनाएं भी मिली हैं।`;
        }
    } else {
        if (isEnglish) {
            answer = "I couldn't identify specific details in your request. Here are some widely available schemes for rural households.";
        } else {
            answer = "मुझे आपकी स्थिति के बारे में स्पष्ट विवरण नहीं मिला। यहां कुछ प्रमुख योजनाएं दी गई हैं जो अधिकांश परिवारों के लिए उपलब्ध हैं।";
        }
    }

    return {
        answer: answer,
        language: isEnglish ? 'en' : 'hi',
        relevantSchemes: relevantSchemes
    };
}

// Simple CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
};

const server = http.createServer((req, res) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(200, corsHeaders);
        res.end();
        return;
    }

    // Root route - redirect or show helpful info
    if (req.url === '/' || req.url === '') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
            <html>
                <head><title>Sarkari-Simpler Backend</title></head>
                <body style="font-family: sans-serif; padding: 2rem; line-height: 1.6; background: #0f172a; color: #f1f5f9;">
                    <h1>🚀 Sarkari-Simpler Backend (Mock)</h1>
                    <p>The backend API is running successfully on port 8787.</p>
                    <div style="background: #1e293b; padding: 1rem; border-radius: 8px; margin: 1rem 0;">
                        <p>👉 <strong>To see the app UI, go here:</strong> 
                           <a href="http://localhost:8000" style="color: #6366f1; font-weight: bold; font-size: 1.2rem;">http://localhost:8000</a>
                        </p>
                    </div>
                    <ul>
                        <li>Health Check: <a href="/health" style="color: #818cf8;">/health</a></li>
                        <li>API Endpoint: <code>/api/query</code> (POST)</li>
                    </ul>
                </body>
            </html>
        `);
        return;
    }

    // Health check
    if (req.url === '/health') {
        res.writeHead(200, corsHeaders);
        res.end(JSON.stringify({
            status: 'healthy',
            mode: 'mock',
            schemes: Object.keys(schemes).length,
            timestamp: Date.now()
        }));
        return;
    }

    // Main query endpoint
    if (req.url === '/api/query' && req.method === 'POST') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const query = data.query || '';

                console.log(`📥 Query received: "${query}"`);

                // Simulate processing delay
                setTimeout(() => {
                    const response = getMockResponse(query);
                    console.log(`📤 Response sent with ${response.relevantSchemes.length} schemes`);

                    res.writeHead(200, corsHeaders);
                    res.end(JSON.stringify(response));
                }, 500); // Simulate AI processing time

            } catch (error) {
                console.error('Error:', error);
                res.writeHead(500, corsHeaders);
                res.end(JSON.stringify({ error: 'Internal server error' }));
            }
        });
        return;
    }

    // 404
    res.writeHead(404, corsHeaders);
    res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
    console.log('\n🚀 Sarkari-Simpler Mock Server Started! (EXPANDED VERSION)\n');
    console.log(`   Local:    http://localhost:${PORT}`);
    console.log(`   Health:   http://localhost:${PORT}/health`);
    console.log(`   API:      http://localhost:${PORT}/api/query\n`);
    console.log(`📊 Schemes loaded: ${Object.keys(schemes).length}`);
    console.log('   - Farmers, Housing, Health, Employment, Food');
    console.log('   - Business, Women, Education, Artisans');
    console.log('   - Maternity, Pension, Construction, Street Vendors');
    console.log('   - Girl Child, LPG\n');
    console.log('📝 Note: This is a MOCK server for demo purposes.');
    console.log('   It simulates responses without Cloudflare AI.\n');
    console.log('💡 Open frontend/index.html in your browser to test!');
    console.log('   Try queries like: "मैं दुकान खोलना चाहता हूं"\n');
    console.log('Press Ctrl+C to stop\n');
});
