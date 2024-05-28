        const conversionFactors = {
                'iu': { 'mcg': 0.025, 'mg': 0.000025, 'g': 0.000000025 },
                'mcg': { 'mg': 0.001, 'iu': 40, 'g': 0.000001 },
                'mg': { 'mcg': 1000, 'iu': 40000, 'g': 0.001 },
                'g': { 'mcg': 1000000, 'mg': 1000, 'iu': 40000000 },
                'ml': { 'g': 1 }, 
                 'l': { 'ml': 1000, 'g': 1000 },
            };


        function convertUnits() {
                const fromUnit = document.getElementById('from-unit').value;
                const toUnit = document.getElementById('to-unit').value;
                let amount = parseFloat(document.getElementById('amount').value);
                const resultElement = document.getElementById('result');
                const errorElement = document.getElementById('error');

                if (!amount) {
                    errorElement.textContent = 'Proszę wpisać wartość do przeliczenia.';
                    errorElement.style.display = 'block';
                    resultElement.style.display = 'none';
                    return;
                }

                // Obsługa wartości mieszanych
                if (isNaN(amount)) {
                    amount = parseMixedValue(document.getElementById('amount').value);
                }

                if (fromUnit === toUnit) {
                    errorElement.textContent = 'Wybierz różne jednostki do konwersji.';
                    errorElement.style.display = 'block';
                    resultElement.style.display = 'none';
                    return;
                }

                if (!conversionFactors[fromUnit] || !conversionFactors[fromUnit][toUnit]) {
                    errorElement.textContent = 'Nie można przeliczyć między wybranymi jednostkami.';
                    errorElement.style.display = 'block';
                    resultElement.style.display = 'none';
                    return;
                }

                const factor = conversionFactors[fromUnit][toUnit];
                const resultValue = (amount * factor).toFixed(1);
                const result = `${amount} ${fromUnit} to około ${resultValue} ${toUnit}.`;
                resultElement.textContent = result;
                resultElement.style.display = 'block';
                errorElement.style.display = 'none';
            }


        function resetCalculator() {
            document.getElementById('from-unit').value = 'iu';
            document.getElementById('to-unit').value = 'mcg';
            document.getElementById('amount').value = '';
            document.getElementById('result').style.display = 'none';
            document.getElementById('error').style.display = 'none';
            document.getElementById('result').textContent = '';
            document.getElementById('error').textContent = '';
        }