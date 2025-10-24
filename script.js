// CalcHub Main Script
// Free API, no keys needed!

console.log('Loading CalcHub...');

window.addEventListener('load', function() {
    console.log('Ready to calculate!');
    
    // Storage helper that won't crash if localStorage is blocked
    const storage = {
        get: function(key, fallback) {
            try {
                return localStorage.getItem(key) || fallback;
            } catch(e) {
                return fallback;
            }
        },
        set: function(key, value) {
            try {
                localStorage.setItem(key, value);
                return true;
            } catch(e) {
                return false;
            }
        }
    };

    // Language stuff
    let currentLang = storage.get('language', 'en');
    
    function t(key) {
        if (typeof translations === 'undefined') return key;
        return translations[currentLang]?.[key] || translations.en?.[key] || key;
    }
    
    function updateTranslations() {
        if (typeof translations === 'undefined') return;
        
        document.querySelectorAll('[data-translate]').forEach(function(el) {
            const key = el.getAttribute('data-translate');
            const translated = t(key);
            
            if (el.tagName === 'INPUT' && el.placeholder) {
                el.placeholder = translated;
            } else if (el.tagName === 'BUTTON' || el.tagName === 'A') {
                el.textContent = translated;
            } else {
                el.textContent = translated;
            }
        });
    }

    // Language selector
    const langSelector = document.getElementById('languageSelector');
    if (langSelector) {
        langSelector.value = currentLang;
        langSelector.addEventListener('change', function() {
            currentLang = this.value;
            storage.set('language', currentLang);
            updateTranslations();
        });
    }

    // Dark mode toggle
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;

    if (themeToggle) {
        const savedTheme = storage.get('theme', 'light');
        if (savedTheme === 'dark') {
            body.classList.add('dark-theme');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }

        themeToggle.addEventListener('click', function() {
            body.classList.toggle('dark-theme');
            const isDark = body.classList.contains('dark-theme');
            themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
            storage.set('theme', isDark ? 'dark' : 'light');
        });
    }

    // Mobile menu toggle
    const mobileToggle = document.getElementById('mobileToggle');
    const nav = document.getElementById('nav');

    if (mobileToggle && nav) {
        mobileToggle.addEventListener('click', function() {
            nav.classList.toggle('active');
            mobileToggle.classList.toggle('active');
        });
    }

    // Close menu when clicking nav links
    document.querySelectorAll('.nav-link').forEach(function(link) {
        link.addEventListener('click', function() {
            if (nav) nav.classList.remove('active');
            if (mobileToggle) mobileToggle.classList.remove('active');
        });
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const headerHeight = 80;
                const targetPosition = target.offsetTop - headerHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Modal management
    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeModal(modal) {
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    // Wire up calculator cards
    document.querySelectorAll('.calculator-card').forEach(function(card) {
        const calcType = card.getAttribute('data-calculator');
        card.style.cursor = 'pointer';
        
        card.addEventListener('click', function() {
            openModal(calcType + 'Modal');
        });
    });

    // Close buttons
    document.querySelectorAll('.modal-close').forEach(function(btn) {
        btn.addEventListener('click', function() {
            closeModal(this.closest('.modal'));
        });
    });

    // Click outside modal to close
    document.querySelectorAll('.modal').forEach(function(modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) closeModal(modal);
        });
    });

    // ESC key closes modals
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.active').forEach(function(modal) {
                closeModal(modal);
            });
        }
    });

    // History system - keeps track of all calculations
    let calculationHistory = JSON.parse(storage.get('calcHistory', '[]'));
    
    function saveToHistory(type, data, result) {
        const historyItem = {
            id: Date.now(),
            type: type,
            data: data,
            result: result,
            timestamp: new Date().toISOString()
        };
        
        calculationHistory.unshift(historyItem);
        
        // Keep last 50 items only
        if (calculationHistory.length > 50) {
            calculationHistory = calculationHistory.slice(0, 50);
        }
        
        storage.set('calcHistory', JSON.stringify(calculationHistory));
        updateHistoryBadge();
        showToast('Saved to history!');
    }
    
    function updateHistoryBadge() {
        const historyBtn = document.getElementById('historyBtn');
        if (historyBtn) {
            let badge = historyBtn.querySelector('.badge');
            if (calculationHistory.length > 0) {
                if (!badge) {
                    badge = document.createElement('span');
                    badge.className = 'badge';
                    historyBtn.appendChild(badge);
                }
                badge.textContent = calculationHistory.length > 99 ? '99+' : calculationHistory.length;
            } else if (badge) {
                badge.remove();
            }
        }
    }
    
    updateHistoryBadge();
    
    // Simple toast notification
    function showToast(message, duration = 3000) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 4px 16px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(function() {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(function() { toast.remove(); }, 300);
        }, duration);
    }
    
    // History modal
    const historyBtn = document.getElementById('historyBtn');
    if (historyBtn) {
        historyBtn.addEventListener('click', function() {
            renderHistory();
            openModal('historyModal');
        });
    }
    
    function renderHistory() {
        const historyList = document.getElementById('historyList');
        if (!historyList) return;
        
        if (calculationHistory.length === 0) {
            historyList.innerHTML = '<p class="empty-state">No calculations saved yet</p>';
            return;
        }
        
        historyList.innerHTML = calculationHistory.map(function(item) {
            const date = new Date(item.timestamp).toLocaleString();
            return `
                <div class="history-item" data-id="${item.id}">
                    <div class="history-item-header">
                        <span class="history-item-title">
                            <i class="fas fa-calculator"></i>
                            ${item.type}
                        </span>
                        <span class="history-item-date">${date}</span>
                    </div>
                    <div class="history-item-content">
                        ${item.result}
                    </div>
                    <div class="history-item-actions">
                        <button class="btn btn-secondary delete-history" data-id="${item.id}">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        // Wire up delete buttons
        historyList.querySelectorAll('.delete-history').forEach(function(btn) {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                calculationHistory = calculationHistory.filter(function(item) {
                    return item.id !== id;
                });
                storage.set('calcHistory', JSON.stringify(calculationHistory));
                updateHistoryBadge();
                renderHistory();
            });
        });
    }
    
    // Clear all history
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', function() {
            if (confirm('Clear all history?')) {
                calculationHistory = [];
                storage.set('calcHistory', '[]');
                updateHistoryBadge();
                renderHistory();
                showToast('History cleared');
            }
        });
    }

    // PDF export using jsPDF
    function exportToPDF(title, content) {
        if (typeof jspdf === 'undefined') {
            alert('PDF library not loaded');
            return;
        }
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        doc.setFontSize(20);
        doc.text(title, 20, 20);
        
        doc.setFontSize(10);
        doc.text(new Date().toLocaleString(), 20, 30);
        
        doc.setFontSize(12);
        const lines = doc.splitTextToSize(content, 170);
        doc.text(lines, 20, 40);
        
        doc.setFontSize(8);
        doc.text('Generated by CalcHub', 20, 280);
        
        const filename = title.replace(/\s+/g, '_') + '_' + Date.now() + '.pdf';
        doc.save(filename);
        
        showToast('PDF downloaded!');
    }

    // ============================================
    // CURRENCY CONVERTER - Using FREE Frankfurter API
    // No API key needed!
    // ============================================
    
    // Extended currency list
    const currencies = [
        'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'SEK', 'NZD',
        'MXN', 'SGD', 'HKD', 'NOK', 'KRW', 'TRY', 'RUB', 'INR', 'BRL', 'ZAR',
        'DKK', 'PLN', 'TWD', 'THB', 'MYR', 'HUF', 'CZK', 'ILS', 'CLP', 'PHP',
        'AED', 'IDR', 'RON', 'BGN', 'HRK', 'ISK'
    ];
    
    const fromCurrency = document.getElementById('fromCurrency');
    const toCurrency = document.getElementById('toCurrency');
    
    if (fromCurrency && toCurrency) {
        const options = currencies.map(c => `<option value="${c}">${c}</option>`).join('');
        fromCurrency.innerHTML = options;
        toCurrency.innerHTML = options;
        fromCurrency.value = 'USD';
        toCurrency.value = 'EUR';
    }

    const convertCurrencyBtn = document.getElementById('convertCurrency');
    if (convertCurrencyBtn) {
        convertCurrencyBtn.addEventListener('click', async function() {
            const amount = parseFloat(document.getElementById('currencyAmount').value);
            const from = document.getElementById('fromCurrency').value;
            const to = document.getElementById('toCurrency').value;
            const resultBox = document.getElementById('currencyResult');
            const rateInfo = document.getElementById('rateInfo');
            
            if (!amount || amount <= 0) {
                showError(resultBox, 'Enter a valid amount');
                return;
            }
            
            this.disabled = true;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Converting...';
            
            try {
                // Frankfurter API - totally free, no limits!
                const url = `https://api.frankfurter.app/latest?amount=${amount}&from=${from}&to=${to}`;
                const response = await fetch(url);
                const data = await response.json();
                
                const result = data.rates[to];
                const rate = result / amount;
                
                resultBox.innerHTML = `
                    <h3>${result.toFixed(2)} ${to}</h3>
                    <p>${amount.toFixed(2)} ${from} = ${result.toFixed(2)} ${to}</p>
                `;
                resultBox.classList.add('show');
                
                rateInfo.innerHTML = `
                    <p><strong>Rate:</strong> 1 ${from} = ${rate.toFixed(6)} ${to}</p>
                    <p><strong>Updated:</strong> ${data.date}</p>
                    <p><strong>Source:</strong> European Central Bank</p>
                `;
                rateInfo.classList.add('show');
                
                saveToHistory('Currency Conversion', 
                    `${amount} ${from} to ${to}`,
                    `${result.toFixed(2)} ${to}`
                );
                
            } catch (error) {
                console.error(error);
                showError(resultBox, 'Connection error. Check your internet.');
            }
            
            this.disabled = false;
            this.innerHTML = '<i class="fas fa-calculator"></i> Convert';
        });
    }

    const swapCurrencyBtn = document.getElementById('swapCurrency');
    if (swapCurrencyBtn) {
        swapCurrencyBtn.addEventListener('click', function() {
            const temp = fromCurrency.value;
            fromCurrency.value = toCurrency.value;
            toCurrency.value = temp;
        });
    }

    // ============================================
    // INFLATION CALCULATOR
    // ============================================
    
    const calculateInflationBtn = document.getElementById('calculateInflation');
    if (calculateInflationBtn) {
        calculateInflationBtn.addEventListener('click', function() {
            const amount = parseFloat(document.getElementById('inflationAmount').value);
            const startYear = parseInt(document.getElementById('startYear').value);
            const endYear = parseInt(document.getElementById('endYear').value);
            const rate = parseFloat(document.getElementById('inflationRate').value) / 100;
            const resultBox = document.getElementById('inflationResult');
            
            if (!amount || !startYear || !endYear || !rate) {
                showError(resultBox, 'Fill in all fields');
                return;
            }
            
            if (startYear >= endYear) {
                showError(resultBox, 'End year must be after start year');
                return;
            }
            
            const years = endYear - startYear;
            const futureValue = amount * Math.pow(1 + rate, years);
            const totalInflation = ((futureValue - amount) / amount) * 100;
            
            resultBox.innerHTML = `
                <h3>$${futureValue.toFixed(2)}</h3>
                <p>Future value of $${amount.toFixed(2)} after ${years} years</p>
                <div class="result-details">
                    <p><span>Original:</span> <span>$${amount.toFixed(2)}</span></p>
                    <p><span>Future Value:</span> <span>$${futureValue.toFixed(2)}</span></p>
                    <p><span>Total Inflation:</span> <span>${totalInflation.toFixed(2)}%</span></p>
                    <p><span>Value Lost:</span> <span>$${(futureValue - amount).toFixed(2)}</span></p>
                </div>
            `;
            resultBox.classList.add('show');
            
            saveToHistory('Inflation', 
                `$${amount} from ${startYear} to ${endYear} at ${(rate*100).toFixed(1)}%`,
                `Future value: $${futureValue.toFixed(2)}`
            );
        });
    }

    // ============================================
    // LOAN CALCULATOR
    // ============================================
    
    const calculateLoanBtn = document.getElementById('calculateLoan');
    if (calculateLoanBtn) {
        calculateLoanBtn.addEventListener('click', function() {
            const principal = parseFloat(document.getElementById('loanAmount').value);
            const annualRate = parseFloat(document.getElementById('interestRate').value) / 100;
            const years = parseInt(document.getElementById('loanTerm').value);
            const resultBox = document.getElementById('loanResult');
            const scheduleDiv = document.getElementById('amortizationSchedule');
            
            if (!principal || !annualRate || !years) {
                showError(resultBox, 'Fill in all fields');
                return;
            }
            
            const monthlyRate = annualRate / 12;
            const numPayments = years * 12;
            
            // Standard mortgage payment formula
            const monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                                  (Math.pow(1 + monthlyRate, numPayments) - 1);
            
            const totalPayment = monthlyPayment * numPayments;
            const totalInterest = totalPayment - principal;
            
            resultBox.innerHTML = `
                <h3>$${monthlyPayment.toFixed(2)}/month</h3>
                <p>Monthly payment for ${years} years</p>
                <div class="result-details">
                    <p><span>Loan Amount:</span> <span>$${principal.toFixed(2)}</span></p>
                    <p><span>Monthly Payment:</span> <span>$${monthlyPayment.toFixed(2)}</span></p>
                    <p><span>Total Interest:</span> <span>$${totalInterest.toFixed(2)}</span></p>
                    <p><span>Total Payment:</span> <span>$${totalPayment.toFixed(2)}</span></p>
                </div>
            `;
            resultBox.classList.add('show');
            
            // Build payment schedule for first year
            let balance = principal;
            let scheduleHTML = '<h3>First Year Payment Breakdown</h3><table class="amortization-table"><thead><tr><th>Month</th><th>Payment</th><th>Principal</th><th>Interest</th><th>Balance</th></tr></thead><tbody>';
            
            for (let i = 1; i <= Math.min(12, numPayments); i++) {
                const interestPayment = balance * monthlyRate;
                const principalPayment = monthlyPayment - interestPayment;
                balance -= principalPayment;
                
                scheduleHTML += `
                    <tr>
                        <td>${i}</td>
                        <td>$${monthlyPayment.toFixed(2)}</td>
                        <td>$${principalPayment.toFixed(2)}</td>
                        <td>$${interestPayment.toFixed(2)}</td>
                        <td>$${balance.toFixed(2)}</td>
                    </tr>
                `;
            }
            
            scheduleHTML += '</tbody></table>';
            scheduleDiv.innerHTML = scheduleHTML;
            scheduleDiv.classList.add('show');
            
            saveToHistory('Loan', 
                `$${principal} at ${(annualRate*100).toFixed(2)}% for ${years} years`,
                `$${monthlyPayment.toFixed(2)}/month`
            );
        });
    }

    // ============================================
    // INVESTMENT CALCULATOR
    // ============================================
    
    const calculateInvestmentBtn = document.getElementById('calculateInvestment');
    if (calculateInvestmentBtn) {
        calculateInvestmentBtn.addEventListener('click', function() {
            const initial = parseFloat(document.getElementById('initialInvestment').value);
            const monthly = parseFloat(document.getElementById('monthlyContribution').value);
            const returnRate = parseFloat(document.getElementById('annualReturn').value) / 100;
            const years = parseInt(document.getElementById('investmentYears').value);
            const resultBox = document.getElementById('investmentResult');
            
            if (!initial || monthly < 0 || !returnRate || !years) {
                showError(resultBox, 'Fill in all fields');
                return;
            }
            
            const monthlyRate = returnRate / 12;
            const months = years * 12;
            
            // Future value of initial investment
            const fvInitial = initial * Math.pow(1 + monthlyRate, months);
            
            // Future value of monthly contributions
            const fvContributions = monthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
            
            const totalValue = fvInitial + fvContributions;
            const totalContributed = initial + (monthly * months);
            const totalEarnings = totalValue - totalContributed;
            const roi = ((totalEarnings / totalContributed) * 100);
            
            resultBox.innerHTML = `
                <h3>$${totalValue.toFixed(2)}</h3>
                <p>Total value after ${years} years</p>
                <div class="result-details">
                    <p><span>Initial:</span> <span>$${initial.toFixed(2)}</span></p>
                    <p><span>Total Contributed:</span> <span>$${totalContributed.toFixed(2)}</span></p>
                    <p><span>Total Earnings:</span> <span>$${totalEarnings.toFixed(2)}</span></p>
                    <p><span>ROI:</span> <span>${roi.toFixed(2)}%</span></p>
                </div>
            `;
            resultBox.classList.add('show');
            
            saveToHistory('Investment', 
                `$${initial} + $${monthly}/mo for ${years} years at ${(returnRate*100).toFixed(1)}%`,
                `Final value: $${totalValue.toFixed(2)}`
            );
        });
    }
    
    // Export investment to PDF
    const exportInvestmentBtn = document.getElementById('exportInvestment');
    if (exportInvestmentBtn) {
        exportInvestmentBtn.addEventListener('click', function() {
            const resultBox = document.getElementById('investmentResult');
            if (!resultBox.classList.contains('show')) {
                alert('Calculate first!');
                return;
            }
            exportToPDF('Investment Calculation', resultBox.innerText);
        });
    }

    const saveInvestmentBtn = document.getElementById('saveInvestment');
    if (saveInvestmentBtn) {
        saveInvestmentBtn.addEventListener('click', function() {
            const resultBox = document.getElementById('investmentResult');
            if (!resultBox.classList.contains('show')) {
                alert('Calculate first!');
                return;
            }
            showToast('Already saved to history!');
        });
    }

    // ============================================
    // BMR/CALORIE CALCULATOR
    // ============================================
    
    const calculateBMRBtn = document.getElementById('calculateBMR');
    if (calculateBMRBtn) {
        calculateBMRBtn.addEventListener('click', function() {
            const gender = document.querySelector('input[name="gender"]:checked').value;
            const age = parseInt(document.getElementById('age').value);
            const weight = parseFloat(document.getElementById('weight').value);
            const height = parseFloat(document.getElementById('height').value);
            const activityLevel = parseFloat(document.getElementById('activityLevel').value);
            const resultBox = document.getElementById('bmrResult');
            
            if (!age || !weight || !height) {
                showError(resultBox, 'Fill in all fields');
                return;
            }
            
            // Mifflin-St Jeor equation
            let bmr;
            if (gender === 'male') {
                bmr = 10 * weight + 6.25 * height - 5 * age + 5;
            } else {
                bmr = 10 * weight + 6.25 * height - 5 * age - 161;
            }
            
            const tdee = bmr * activityLevel;
            const weightLoss = tdee - 500;
            const weightGain = tdee + 500;
            
            resultBox.innerHTML = `
                <h3>${Math.round(tdee)} cal/day</h3>
                <p>Total Daily Energy Expenditure</p>
                <div class="result-details">
                    <p><span>BMR:</span> <span>${Math.round(bmr)} cal</span></p>
                    <p><span>Maintain:</span> <span>${Math.round(tdee)} cal</span></p>
                    <p><span>Lose Weight:</span> <span>${Math.round(weightLoss)} cal</span></p>
                    <p><span>Gain Weight:</span> <span>${Math.round(weightGain)} cal</span></p>
                </div>
            `;
            resultBox.classList.add('show');
            
            saveToHistory('BMR/Calorie', 
                `${gender}, ${age}yo, ${weight}kg, ${height}cm`,
                `TDEE: ${Math.round(tdee)} cal/day`
            );
        });
    }

    // ============================================
    // BMI CALCULATOR WITH CHART
    // ============================================
    
    const calculateBMIBtn = document.getElementById('calculateBMI');
    if (calculateBMIBtn) {
        calculateBMIBtn.addEventListener('click', function() {
            let weight = parseFloat(document.getElementById('bmiWeight').value);
            let height = parseFloat(document.getElementById('bmiHeight').value);
            const weightUnit = document.getElementById('weightUnit').value;
            const heightUnit = document.getElementById('heightUnit').value;
            const resultBox = document.getElementById('bmiResult');
            
            if (!weight || !height) {
                showError(resultBox, 'Enter weight and height');
                return;
            }
            
            // Convert to metric
            if (weightUnit === 'lbs') {
                weight = weight * 0.453592;
            }
            
            if (heightUnit === 'inches') {
                height = height * 2.54;
            } else if (heightUnit === 'feet') {
                height = height * 30.48;
            }
            
            const heightInMeters = height / 100;
            const bmi = weight / (heightInMeters * heightInMeters);
            
            // Figure out category
            let category, color, advice;
            if (bmi < 18.5) {
                category = 'Underweight';
                color = '#3b82f6';
                advice = 'Consider consulting a healthcare provider about healthy weight gain.';
            } else if (bmi < 25) {
                category = 'Normal Weight';
                color = '#10b981';
                advice = 'Great! Maintain your current lifestyle.';
            } else if (bmi < 30) {
                category = 'Overweight';
                color = '#f59e0b';
                advice = 'Consider a balanced diet and regular exercise.';
            } else {
                category = 'Obese';
                color = '#ef4444';
                advice = 'Consult a healthcare provider for personalized guidance.';
            }
            
            resultBox.innerHTML = `
                <h3 style="color: ${color}">${bmi.toFixed(1)}</h3>
                <p>${category}</p>
                <div class="result-details">
                    <p><span>BMI:</span> <span>${bmi.toFixed(1)}</span></p>
                    <p><span>Category:</span> <span>${category}</span></p>
                    <p><span>Weight:</span> <span>${weight.toFixed(1)} kg</span></p>
                    <p><span>Height:</span> <span>${height.toFixed(1)} cm</span></p>
                </div>
                <p style="margin-top: 1rem; font-size: 0.9rem; opacity: 0.9;">${advice}</p>
            `;
            resultBox.classList.add('show');
            
            // Show category badges
            const categoriesDiv = document.querySelector('.bmi-categories');
            if (categoriesDiv) {
                categoriesDiv.classList.add('show');
                categoriesDiv.querySelectorAll('.category').forEach(function(cat) {
                    cat.classList.remove('active');
                });
                
                if (bmi < 18.5) {
                    categoriesDiv.querySelector('.underweight').classList.add('active');
                } else if (bmi < 25) {
                    categoriesDiv.querySelector('.normal').classList.add('active');
                } else if (bmi < 30) {
                    categoriesDiv.querySelector('.overweight').classList.add('active');
                } else {
                    categoriesDiv.querySelector('.obese').classList.add('active');
                }
            }
            
            // Draw chart if Chart.js loaded
            const chartContainer = document.querySelector('.bmi-chart-container');
            const chartCanvas = document.getElementById('bmiChart');
            
            if (chartCanvas && typeof Chart !== 'undefined') {
                chartContainer.classList.add('show');
                
                if (window.bmiChartInstance) {
                    window.bmiChartInstance.destroy();
                }
                
                const ctx = chartCanvas.getContext('2d');
                window.bmiChartInstance = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: ['Underweight', 'Normal', 'Overweight', 'Obese', 'Your BMI'],
                        datasets: [{
                            label: 'BMI Range',
                            data: [18.5, 24.9, 29.9, 40, bmi],
                            backgroundColor: [
                                '#3b82f6',
                                '#10b981',
                                '#f59e0b',
                                '#ef4444',
                                color
                            ],
                            borderWidth: 1,
                            borderColor: '#fff'
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: true,
                        plugins: {
                            legend: { display: false }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                max: 45
                            }
                        }
                    }
                });
            }
            
            saveToHistory('BMI', 
                `${weight.toFixed(1)}kg, ${height.toFixed(1)}cm`,
                `BMI: ${bmi.toFixed(1)} (${category})`
            );
        });
    }
    
    // Export BMI to PDF
    const exportBMIBtn = document.getElementById('exportBMI');
    if (exportBMIBtn) {
        exportBMIBtn.addEventListener('click', function() {
            const resultBox = document.getElementById('bmiResult');
            if (!resultBox.classList.contains('show')) {
                alert('Calculate BMI first!');
                return;
            }
            exportToPDF('BMI Calculation', resultBox.innerText);
        });
    }

    const saveBMIBtn = document.getElementById('saveBMI');
    if (saveBMIBtn) {
        saveBMIBtn.addEventListener('click', function() {
            showToast('Already saved to history!');
        });
    }

    // ============================================
    // MACRO CALCULATOR
    // ============================================
    
    const calculateMacroBtn = document.getElementById('calculateMacro');
    if (calculateMacroBtn) {
        calculateMacroBtn.addEventListener('click', function() {
            const goal = document.querySelector('input[name="goal"]:checked').value;
            const calories = parseInt(document.getElementById('macroCalories').value);
            const weight = parseFloat(document.getElementById('macroWeight').value);
            const resultBox = document.getElementById('macroResult');
            
            if (!calories || !weight) {
                showError(resultBox, 'Fill in all fields');
                return;
            }
            
            let proteinRatio, fatRatio, carbRatio;
            if (goal === 'loss') {
                proteinRatio = 0.40; 
                fatRatio = 0.30; 
                carbRatio = 0.30;
            } else if (goal === 'gain') {
                proteinRatio = 0.30; 
                fatRatio = 0.25; 
                carbRatio = 0.45;
            } else {
                proteinRatio = 0.30; 
                fatRatio = 0.30; 
                carbRatio = 0.40;
            }
            
            const proteinGrams = (calories * proteinRatio) / 4;
            const fatGrams = (calories * fatRatio) / 9;
            const carbGrams = (calories * carbRatio) / 4;
            
            const goalText = goal === 'loss' ? 'weight loss' : 
                           goal === 'gain' ? 'muscle gain' : 'maintenance';
            
            resultBox.innerHTML = `
                <h3>${calories} Calories</h3>
                <p>Daily macros for ${goalText}</p>
                <div class="result-details">
                    <p><span>Protein:</span> <span>${Math.round(proteinGrams)}g (${Math.round(proteinRatio*100)}%)</span></p>
                    <p><span>Carbs:</span> <span>${Math.round(carbGrams)}g (${Math.round(carbRatio*100)}%)</span></p>
                    <p><span>Fat:</span> <span>${Math.round(fatGrams)}g (${Math.round(fatRatio*100)}%)</span></p>
                    <p><span>Protein/kg:</span> <span>${(proteinGrams/weight).toFixed(1)}g/kg</span></p>
                </div>
            `;
            resultBox.classList.add('show');
            
            saveToHistory('Macros', 
                `${calories} cal for ${goalText}`,
                `P: ${Math.round(proteinGrams)}g, C: ${Math.round(carbGrams)}g, F: ${Math.round(fatGrams)}g`
            );
        });
    }

    // ============================================
    // UNIT CONVERTER
    // ============================================
    
    const unitData = {
        length: { 
            meter: 1, kilometer: 0.001, centimeter: 100, millimeter: 1000,
            mile: 0.000621371, yard: 1.09361, foot: 3.28084, inch: 39.3701 
        },
        weight: { 
            kilogram: 1, gram: 1000, milligram: 1000000, 
            pound: 2.20462, ounce: 35.274, ton: 0.001 
        },
        temperature: { 
            celsius: 'c', fahrenheit: 'f', kelvin: 'k' 
        },
        area: { 
            'square meter': 1, 'square kilometer': 0.000001, 
            'square mile': 3.861e-7, 'square foot': 10.7639, 
            acre: 0.000247105, hectare: 0.0001 
        },
        volume: { 
            liter: 1, milliliter: 1000, gallon: 0.264172, 
            quart: 1.05669, pint: 2.11338, 'cubic meter': 0.001 
        }
    };

    const unitCategory = document.getElementById('unitCategory');
    const unitValue = document.getElementById('unitValue');
    const fromUnit = document.getElementById('fromUnit');
    const toUnit = document.getElementById('toUnit');

    function updateUnitOptions() {
        if (!unitCategory || !fromUnit || !toUnit) return;
        
        const category = unitCategory.value;
        const units = Object.keys(unitData[category]);
        
        fromUnit.innerHTML = '';
        toUnit.innerHTML = '';
        
        units.forEach(function(unit, i) {
            fromUnit.innerHTML += `<option value="${unit}">${unit}</option>`;
            toUnit.innerHTML += `<option value="${unit}" ${i===1?'selected':''}>${unit}</option>`;
        });
        
        convertUnit();
    }

    function convertUnit() {
        if (!unitValue || !fromUnit || !toUnit) return;
        
        const value = parseFloat(unitValue.value);
        const category = unitCategory.value;
        const from = fromUnit.value;
        const to = toUnit.value;
        const resultBox = document.getElementById('unitResult');
        
        if (!value) {
            resultBox.classList.remove('show');
            return;
        }
        
        let result;
        
        if (category === 'temperature') {
            result = convertTemp(value, from, to);
        } else {
            result = (value / unitData[category][from]) * unitData[category][to];
        }
        
        resultBox.innerHTML = `
            <h3>${result.toFixed(4)} ${to}</h3>
            <p>${value} ${from} = ${result.toFixed(4)} ${to}</p>
        `;
        resultBox.classList.add('show');
    }

    function convertTemp(value, from, to) {
        let celsius;
        
        if (from === 'celsius') celsius = value;
        else if (from === 'fahrenheit') celsius = (value - 32) * 5/9;
        else celsius = value - 273.15;
        
        if (to === 'celsius') return celsius;
        else if (to === 'fahrenheit') return celsius * 9/5 + 32;
        else return celsius + 273.15;
    }

    if (unitCategory) {
        unitCategory.addEventListener('change', updateUnitOptions);
        updateUnitOptions();
    }
    
    if (unitValue) unitValue.addEventListener('input', convertUnit);
    if (fromUnit) fromUnit.addEventListener('change', convertUnit);
    if (toUnit) toUnit.addEventListener('change', convertUnit);

    const swapUnitBtn = document.getElementById('swapUnit');
    if (swapUnitBtn) {
        swapUnitBtn.addEventListener('click', function() {
            const temp = fromUnit.value;
            fromUnit.value = toUnit.value;
            toUnit.value = temp;
            convertUnit();
        });
    }

    // ============================================
    // TIMEZONE CONVERTER
    // ============================================
    
    const sourceTime = document.getElementById('sourceTime');
    if (sourceTime) {
        const now = new Date();
        const local = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
        sourceTime.value = local;
    }

    const convertTimezoneBtn = document.getElementById('convertTimezone');
    if (convertTimezoneBtn) {
        convertTimezoneBtn.addEventListener('click', function() {
            const sourceTime = document.getElementById('sourceTime').value;
            const sourceOffset = parseFloat(document.getElementById('sourceTimezone').value);
            const targetOffset = parseFloat(document.getElementById('targetTimezone').value);
            const resultBox = document.getElementById('timezoneResult');
            
            if (!sourceTime) {
                showError(resultBox, 'Select a date and time');
                return;
            }
            
            const inputDate = new Date(sourceTime);
            const utcTime = new Date(inputDate.getTime() - (sourceOffset * 3600000));
            const targetTime = new Date(utcTime.getTime() + (targetOffset * 3600000));
            
            resultBox.innerHTML = `
                <h3>${targetTime.toLocaleString()}</h3>
                <p>Converted time</p>
                <div class="result-details">
                    <p><span>Source:</span> <span>${inputDate.toLocaleString()}</span></p>
                    <p><span>Target:</span> <span>${targetTime.toLocaleString()}</span></p>
                    <p><span>Difference:</span> <span>${Math.abs(targetOffset-sourceOffset)}h</span></p>
                </div>
            `;
            resultBox.classList.add('show');
        });
    }

    // ============================================
    // DATA SIZE CONVERTER
    // ============================================
    
    const dataUnits = {
        bit: 0.125, 
        byte: 1, 
        kb: 1024, 
        mb: 1048576, 
        gb: 1073741824, 
        tb: 1099511627776,
        pb: 1125899906842624
    };

    const dataValue = document.getElementById('dataValue');
    const fromData = document.getElementById('fromData');
    const toData = document.getElementById('toData');

    function convertDataSize() {
        if (!dataValue || !fromData || !toData) return;
        
        const value = parseFloat(dataValue.value);
        const resultBox = document.getElementById('dataResult');
        const tableDiv = document.getElementById('dataConversionTable');
        
        if (!value) {
            resultBox.classList.remove('show');
            tableDiv.classList.remove('show');
            return;
        }
        
        const bytes = value * dataUnits[fromData.value];
        const result = bytes / dataUnits[toData.value];
        
        resultBox.innerHTML = `
            <h3>${result.toFixed(2)} ${toData.value.toUpperCase()}</h3>
            <p>${value} ${fromData.value.toUpperCase()} = ${result.toFixed(2)} ${toData.value.toUpperCase()}</p>
        `;
        resultBox.classList.add('show');
        
        // Quick reference table
        let tableHTML = '<h4>Quick Reference</h4>';
        Object.keys(dataUnits).forEach(function(unit) {
            const conv = bytes / dataUnits[unit];
            tableHTML += `
                <div class="conversion-item">
                    <span>${unit.toUpperCase()}</span>
                    <span>${conv.toFixed(2)}</span>
                </div>
            `;
        });
        tableDiv.innerHTML = tableHTML;
        tableDiv.classList.add('show');
    }

    if (dataValue) dataValue.addEventListener('input', convertDataSize);
    if (fromData) fromData.addEventListener('change', convertDataSize);
    if (toData) toData.addEventListener('change', convertDataSize);

    const swapDataBtn = document.getElementById('swapData');
    if (swapDataBtn) {
        swapDataBtn.addEventListener('click', function() {
            const temp = fromData.value;
            fromData.value = toData.value;
            toData.value = temp;
            convertDataSize();
        });
    }

    // ============================================
    // HELPER FUNCTIONS
    // ============================================
    
    function showError(element, message) {
        element.innerHTML = `
            <div style="background: #ef4444; color: white; padding: 1rem; border-radius: 0.5rem;">
                <i class="fas fa-exclamation-triangle"></i> ${message}
            </div>
        `;
        element.classList.add('show');
        setTimeout(function() {
            element.classList.remove('show');
        }, 3000);
    }

    // Newsletter form
    const newsletterBtn = document.querySelector('.newsletter-form button');
    if (newsletterBtn) {
        newsletterBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const input = document.querySelector('.newsletter-form input');
            if (input.value.includes('@')) {
                showToast('Thanks for subscribing!');
                input.value = '';
            } else {
                alert('Enter a valid email');
            }
        });
    }

    // PWA install prompt
    let deferredPrompt;
    
    window.addEventListener('beforeinstallprompt', function(e) {
        e.preventDefault();
        deferredPrompt = e;
        
        if (!window.matchMedia('(display-mode: standalone)').matches) {
            showInstallPrompt();
        }
    });
    
    function showInstallPrompt() {
        const prompt = document.createElement('div');
        prompt.className = 'install-prompt';
        prompt.innerHTML = `
            <i class="fas fa-download"></i>
            <span>Install CalcHub for offline access</span>
            <button class="install-app">Install</button>
            <button class="close-install">Not now</button>
        `;
        
        document.body.appendChild(prompt);
        setTimeout(function() {
            prompt.classList.add('show');
        }, 100);
        
        prompt.querySelector('.install-app').addEventListener('click', async function() {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                deferredPrompt = null;
            }
            prompt.remove();
        });
        
        prompt.querySelector('.close-install').addEventListener('click', function() {
            prompt.remove();
        });
    }
    
    // Register service worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            navigator.serviceWorker.register('/service-worker.js')
                .then(reg => console.log('PWA ready!'))
                .catch(err => console.log('Service worker failed:', err));
        });
    }

    // Run translations
    updateTranslations();
    
    console.log('CalcHub ready!');
    console.log('Currency conversion uses FREE Frankfurter API - no limits!');

        // ============================================
    // LEGAL PAGES - Privacy, Terms, Disclaimer
    // ============================================
    
    // Privacy Policy link
    document.querySelectorAll('a[href="#privacy"]').forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            openModal('privacyModal');
        });
    });
    
    // Terms of Service link
    document.querySelectorAll('a[href="#terms"]').forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            openModal('termsModal');
        });
    });
    
    // Disclaimer link
    document.querySelectorAll('a[href="#disclaimer"]').forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            openModal('disclaimerModal');
        });
    });
});

// Toast animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);
