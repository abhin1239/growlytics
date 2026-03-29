/**
 * Blood Report AI Analyzer Module
 * Rule-based analysis using WHO/ICMR pediatric reference ranges
 */
const BloodAnalyzer = {

    // Reference ranges based on WHO/ICMR guidelines
    REFERENCE_RANGES: {
        hemoglobin: {
            unit: 'g/dL',
            name: 'Hemoglobin',
            ranges: {
                '0-6m': { low_critical: 9.0, low_normal: 10.0, high_normal: 14.0, high_critical: 18.0 },
                '6-12m': { low_critical: 9.5, low_normal: 10.5, high_normal: 13.0, high_critical: 15.0 },
                '1-5y': { low_critical: 10.0, low_normal: 11.0, high_normal: 13.0, high_critical: 15.0 },
                '5-12y': { low_critical: 10.5, low_normal: 11.5, high_normal: 14.5, high_critical: 16.0 },
                '12-18y_M': { low_critical: 11.0, low_normal: 13.0, high_normal: 16.0, high_critical: 18.0 },
                '12-18y_F': { low_critical: 10.5, low_normal: 12.0, high_normal: 15.0, high_critical: 16.5 }
            },
            deficiency: {
                name: 'Anemia',
                symptoms: ['Tiredness', 'Pale skin', 'Reduced appetite', 'Irritability', 'Poor concentration'],
                foods: ['Ragi (റാഗി)', 'Drumstick leaves (മുരിങ്ങയില)', 'Dates (കാരക്ക)', 'Jaggery (ശർക്കര)', 'Spinach (ചീര)', 'Pomegranate']
            }
        },
        vitamin_d: {
            unit: 'ng/mL',
            name: 'Vitamin D',
            ranges: {
                'all': { low_critical: 10.0, low_normal: 20.0, high_normal: 50.0, high_critical: 100.0 }
            },
            deficiency: {
                name: 'Vitamin D Deficiency',
                symptoms: ['Bone pain', 'Muscle weakness', 'Delayed growth', 'Rickets risk', 'Frequent infections'],
                foods: ['Egg yolk', 'Fish (sardine, mackerel)', 'Fortified milk', 'Mushrooms'],
                additionalAdvice: '15 minutes of morning sun exposure (before 9 AM) is essential'
            }
        },
        vitamin_b12: {
            unit: 'pg/mL',
            name: 'Vitamin B12',
            ranges: {
                'all': { low_critical: 150.0, low_normal: 200.0, high_normal: 900.0, high_critical: 1200.0 }
            },
            deficiency: {
                name: 'Vitamin B12 Deficiency',
                symptoms: ['Numbness', 'Tingling', 'Balance problems', 'Poor memory', 'Fatigue'],
                foods: ['Egg (മുട്ട)', 'Fish', 'Milk (പാൽ)', 'Curd (തൈര്)', 'Paneer']
            }
        },
        calcium: {
            unit: 'mg/dL',
            name: 'Calcium',
            ranges: {
                '0-1y': { low_critical: 7.5, low_normal: 8.5, high_normal: 11.0, high_critical: 12.0 },
                '1-18y': { low_critical: 8.0, low_normal: 8.8, high_normal: 10.8, high_critical: 11.5 }
            },
            deficiency: {
                name: 'Calcium Deficiency',
                symptoms: ['Weak bones', 'Dental problems', 'Muscle cramps', 'Delayed growth'],
                foods: ['Milk (പാൽ)', 'Curd (തൈര്)', 'Sesame seeds (എള്ള്)', 'Ragi (റാഗി)', 'Sardines', 'Amaranth leaves']
            }
        },
        serum_iron: {
            unit: 'µg/dL',
            name: 'Serum Iron',
            ranges: {
                'all': { low_critical: 30.0, low_normal: 60.0, high_normal: 170.0, high_critical: 200.0 }
            },
            deficiency: {
                name: 'Iron Deficiency',
                symptoms: ['Weakness', 'Fatigue', 'Brittle nails', 'Cold hands and feet'],
                foods: ['Drumstick leaves', 'Jaggery', 'Black gram', 'Garden cress seeds', 'Dates']
            }
        },
        ferritin: {
            unit: 'ng/mL',
            name: 'Ferritin',
            ranges: {
                '0-5y': { low_critical: 6.0, low_normal: 12.0, high_normal: 140.0, high_critical: 200.0 },
                '5-18y': { low_critical: 7.0, low_normal: 15.0, high_normal: 150.0, high_critical: 200.0 }
            },
            deficiency: {
                name: 'Low Iron Stores',
                symptoms: ['Fatigue', 'Dizziness', 'Shortness of breath'],
                foods: ['Red meat', 'Liver', 'Legumes', 'Dried fruits', 'Green leafy vegetables']
            }
        },
        total_protein: {
            unit: 'g/dL',
            name: 'Total Protein',
            ranges: {
                'all': { low_critical: 5.0, low_normal: 6.0, high_normal: 8.0, high_critical: 9.0 }
            },
            deficiency: {
                name: 'Protein Deficiency',
                symptoms: ['Poor growth', 'Muscle wasting', 'Weak immunity', 'Swelling in feet'],
                foods: ['Egg', 'Fish (Mathi/Ayala)', 'Chicken', 'Dal', 'Groundnuts (കപ്പലണ്ടി)', 'Soy']
            }
        },
        albumin: {
            unit: 'g/dL',
            name: 'Albumin',
            ranges: {
                'all': { low_critical: 2.5, low_normal: 3.5, high_normal: 5.0, high_critical: 5.5 }
            },
            deficiency: {
                name: 'Low Albumin',
                symptoms: ['Swelling', 'Fatigue', 'Poor wound healing'],
                foods: ['Eggs', 'Fish', 'Lean meat', 'Dairy products']
            }
        },
        folic_acid: {
            unit: 'ng/mL',
            name: 'Folic Acid',
            ranges: {
                'all': { low_critical: 2.0, low_normal: 3.0, high_normal: 17.0, high_critical: 20.0 }
            },
            deficiency: {
                name: 'Folic Acid Deficiency',
                symptoms: ['Fatigue', 'Mouth sores', 'Tongue swelling', 'Growth problems'],
                foods: ['Green leafy vegetables', 'Citrus fruits', 'Legumes', 'Fortified cereals']
            }
        },
        zinc: {
            unit: 'µg/dL',
            name: 'Zinc',
            ranges: {
                'all': { low_critical: 50.0, low_normal: 70.0, high_normal: 120.0, high_critical: 150.0 }
            },
            deficiency: {
                name: 'Zinc Deficiency',
                symptoms: ['Slow growth', 'Poor appetite', 'Delayed wound healing', 'Frequent infections'],
                foods: ['Pumpkin seeds', 'Legumes', 'Nuts', 'Dairy', 'Eggs']
            }
        }
    },

    /**
     * Get age group key for a parameter
     */
    getAgeGroup(ageMonths, gender, parameter) {
        const ranges = this.REFERENCE_RANGES[parameter]?.ranges;
        if (!ranges) return 'all';

        // Check for 'all' range first
        if (ranges['all']) return 'all';

        // Age-specific ranges
        if (ageMonths < 6 && ranges['0-6m']) return '0-6m';
        if (ageMonths < 12 && ranges['6-12m']) return '6-12m';
        if (ageMonths < 12 && ranges['0-1y']) return '0-1y';
        if (ageMonths < 60 && ranges['1-5y']) return '1-5y';
        if (ageMonths < 60 && ranges['0-5y']) return '0-5y';
        if (ageMonths < 144 && ranges['5-12y']) return '5-12y';
        if (ageMonths < 144 && ranges['5-18y']) return '5-18y';
        if (ageMonths < 144 && ranges['1-18y']) return '1-18y';

        // Gender-specific for older children
        if (ageMonths >= 144) {
            if (gender === 'Male' && ranges['12-18y_M']) return '12-18y_M';
            if (gender === 'Female' && ranges['12-18y_F']) return '12-18y_F';
            if (ranges['5-18y']) return '5-18y';
            if (ranges['1-18y']) return '1-18y';
        }

        return 'all';
    },

    /**
     * Analyze a single blood parameter
     */
    analyzeParameter(parameter, value, ageMonths, gender) {
        if (value === null || value === undefined || value === '') {
            return null;
        }

        const paramConfig = this.REFERENCE_RANGES[parameter];
        if (!paramConfig) {
            return { status: 'UNKNOWN', message: 'Unknown parameter' };
        }

        const ageGroup = this.getAgeGroup(ageMonths, gender, parameter);
        const range = paramConfig.ranges[ageGroup];

        if (!range) {
            return { status: 'UNKNOWN', message: 'No reference range available' };
        }

        let status, severity, message;

        if (value < range.low_critical) {
            status = 'DEFICIENT';
            severity = 'critical';
            message = `Critically low ${paramConfig.name}`;
        } else if (value < range.low_normal) {
            status = 'BORDERLINE';
            severity = 'moderate';
            message = `Below normal ${paramConfig.name}`;
        } else if (value > range.high_critical) {
            status = 'CRITICAL_HIGH';
            severity = 'critical';
            message = `Critically high ${paramConfig.name}`;
        } else if (value > range.high_normal) {
            status = 'ELEVATED';
            severity = 'moderate';
            message = `Above normal ${paramConfig.name}`;
        } else {
            status = 'NORMAL';
            severity = 'none';
            message = `${paramConfig.name} is within normal range`;
        }

        return {
            parameter,
            name: paramConfig.name,
            value,
            unit: paramConfig.unit,
            status,
            severity,
            message,
            range: {
                low_normal: range.low_normal,
                high_normal: range.high_normal
            },
            deficiency: status === 'DEFICIENT' || status === 'BORDERLINE' ? paramConfig.deficiency : null
        };
    },

    /**
     * Analyze complete blood report
     */
    analyzeReport(reportData, ageMonths, gender) {
        const results = {
            timestamp: new Date().toISOString(),
            childAge: ageMonths,
            gender,
            parameters: [],
            deficiencies: [],
            criticalAlerts: [],
            warnings: [],
            recommendations: [],
            overallStatus: 'NORMAL'
        };

        const parametersToCheck = [
            'hemoglobin', 'vitamin_d', 'vitamin_b12', 'calcium',
            'serum_iron', 'ferritin', 'total_protein', 'albumin',
            'folic_acid', 'zinc'
        ];

        let hasCritical = false;
        let hasModerate = false;

        for (const param of parametersToCheck) {
            const value = reportData[param];
            const analysis = this.analyzeParameter(param, value, ageMonths, gender);

            if (analysis && analysis.status !== 'UNKNOWN') {
                results.parameters.push(analysis);

                if (analysis.severity === 'critical') {
                    hasCritical = true;
                    results.criticalAlerts.push({
                        title: analysis.message,
                        action: 'Consult doctor immediately'
                    });
                    if (analysis.deficiency) {
                        results.deficiencies.push(analysis.deficiency);
                    }
                } else if (analysis.severity === 'moderate') {
                    hasModerate = true;
                    results.warnings.push({
                        title: analysis.message,
                        action: 'Dietary changes recommended'
                    });
                    if (analysis.deficiency) {
                        results.deficiencies.push(analysis.deficiency);
                    }
                }
            }
        }

        // Generate recommendations
        results.recommendations = this.generateRecommendations(results.deficiencies);

        // Set overall status
        if (hasCritical) {
            results.overallStatus = 'CRITICAL';
        } else if (hasModerate) {
            results.overallStatus = 'NEEDS_ATTENTION';
        }

        return results;
    },

    /**
     * Generate food recommendations based on deficiencies
     */
    generateRecommendations(deficiencies) {
        if (!deficiencies || deficiencies.length === 0) {
            return [{
                type: 'general',
                title: 'Maintain Balanced Diet',
                description: 'Continue with a balanced diet including all food groups.',
                foods: ['Rice', 'Vegetables', 'Fish/Egg', 'Milk', 'Fruits']
            }];
        }

        const recommendations = [];
        const addedFoods = new Set();

        for (const def of deficiencies) {
            const uniqueFoods = def.foods.filter(f => !addedFoods.has(f));
            uniqueFoods.forEach(f => addedFoods.add(f));

            recommendations.push({
                type: 'deficiency',
                title: `For ${def.name}`,
                description: def.symptoms.join(', '),
                foods: uniqueFoods.slice(0, 5),
                additionalAdvice: def.additionalAdvice || null
            });
        }

        return recommendations;
    },

    /**
     * Generate parent-friendly alert message
     */
    generateParentAlert(analysisResult) {
        const alerts = [];

        if (analysisResult.overallStatus === 'CRITICAL') {
            alerts.push({
                type: 'critical',
                icon: '🚨',
                title: 'Urgent: Medical Attention Needed',
                message: 'Some blood values are critically low. Please consult your pediatrician within 24 hours.',
                details: analysisResult.criticalAlerts.map(a => a.title)
            });
        }

        if (analysisResult.warnings.length > 0) {
            alerts.push({
                type: 'warning',
                icon: '⚠️',
                title: 'Dietary Changes Recommended',
                message: 'Some values are below normal. Simple dietary changes can help.',
                details: analysisResult.warnings.map(w => w.title)
            });
        }

        if (analysisResult.deficiencies.length > 0) {
            const symptomWatch = [];
            analysisResult.deficiencies.forEach(d => {
                symptomWatch.push(...d.symptoms.slice(0, 2));
            });

            alerts.push({
                type: 'info',
                icon: '👀',
                title: 'Symptoms to Watch For',
                message: 'Monitor your child for these symptoms:',
                details: [...new Set(symptomWatch)].slice(0, 5)
            });
        }

        if (analysisResult.recommendations.length > 0) {
            const allFoods = [];
            analysisResult.recommendations.forEach(r => {
                allFoods.push(...r.foods);
            });

            alerts.push({
                type: 'food',
                icon: '🥗',
                title: 'Recommended Foods',
                message: 'Include these Kerala-friendly foods in daily diet:',
                details: [...new Set(allFoods)].slice(0, 8)
            });
        }

        return alerts;
    },

    /**
     * Get status badge styling
     */
    getStatusBadge(status) {
        const styles = {
            'NORMAL': { class: 'success', text: 'Normal' },
            'BORDERLINE': { class: 'warning', text: 'Borderline' },
            'DEFICIENT': { class: 'danger', text: 'Deficient' },
            'ELEVATED': { class: 'warning', text: 'Elevated' },
            'CRITICAL_HIGH': { class: 'danger', text: 'Critical' },
            'CRITICAL': { class: 'danger', text: 'Critical' },
            'NEEDS_ATTENTION': { class: 'warning', text: 'Needs Attention' }
        };
        return styles[status] || { class: 'info', text: status };
    }
};

// Make BloodAnalyzer available globally
window.BloodAnalyzer = BloodAnalyzer;
