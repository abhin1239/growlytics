/**
 * Growth Monitoring Module
 * Includes WHO Z-score calculations and malnutrition assessment
 */
const GrowthModule = {

    // WHO Child Growth Standards LMS values (simplified for key ages)
    // Source: WHO Multicentre Growth Reference Study Group
    WHO_STANDARDS: {
        // Weight-for-age (WAZ) - Boys
        wfa_boys: {
            0: { L: 0.3487, M: 3.3464, S: 0.14602 },
            3: { L: 0.2297, M: 6.3762, S: 0.12690 },
            6: { L: 0.1738, M: 7.9340, S: 0.12433 },
            12: { L: 0.1308, M: 9.6479, S: 0.11727 },
            24: { L: 0.0949, M: 12.2392, S: 0.11258 },
            36: { L: 0.0601, M: 14.3450, S: 0.11187 },
            48: { L: 0.0252, M: 16.3489, S: 0.11260 },
            60: { L: -0.0098, M: 18.3730, S: 0.11438 }
        },
        // Weight-for-age (WAZ) - Girls
        wfa_girls: {
            0: { L: 0.3809, M: 3.2322, S: 0.14171 },
            3: { L: 0.2181, M: 5.8458, S: 0.12676 },
            6: { L: 0.1614, M: 7.2970, S: 0.12570 },
            12: { L: 0.1119, M: 8.9500, S: 0.12046 },
            24: { L: 0.0765, M: 11.5000, S: 0.11758 },
            36: { L: 0.0409, M: 13.8610, S: 0.11782 },
            48: { L: 0.0049, M: 16.0910, S: 0.11925 },
            60: { L: -0.0310, M: 18.2430, S: 0.12143 }
        },
        // Height-for-age (HAZ) - Boys
        hfa_boys: {
            0: { L: 1, M: 49.8842, S: 0.03795 },
            3: { L: 1, M: 61.4292, S: 0.03445 },
            6: { L: 1, M: 67.6236, S: 0.03225 },
            12: { L: 1, M: 75.7488, S: 0.02992 },
            24: { L: 1, M: 87.8161, S: 0.03015 },
            36: { L: 1, M: 96.0954, S: 0.02917 },
            48: { L: 1, M: 103.3020, S: 0.02838 },
            60: { L: 1, M: 110.0108, S: 0.02789 }
        },
        // Height-for-age (HAZ) - Girls
        hfa_girls: {
            0: { L: 1, M: 49.1477, S: 0.03790 },
            3: { L: 1, M: 59.8029, S: 0.03529 },
            6: { L: 1, M: 65.7311, S: 0.03316 },
            12: { L: 1, M: 74.0015, S: 0.03109 },
            24: { L: 1, M: 86.4153, S: 0.03187 },
            36: { L: 1, M: 95.0778, S: 0.03102 },
            48: { L: 1, M: 102.6928, S: 0.02976 },
            60: { L: 1, M: 109.4327, S: 0.02910 }
        },
        // Weight-for-height (WHZ) - Boys (height in cm as key)
        wfh_boys: {
            45: { L: -0.3521, M: 2.4410, S: 0.09182 },
            50: { L: -0.1600, M: 3.3300, S: 0.08900 },
            55: { L: -0.0700, M: 4.3900, S: 0.08800 },
            60: { L: -0.0100, M: 5.4900, S: 0.08800 },
            65: { L: 0.0200, M: 6.5900, S: 0.08900 },
            70: { L: 0.0400, M: 7.6300, S: 0.09000 },
            75: { L: 0.0500, M: 8.6100, S: 0.09200 },
            80: { L: 0.0500, M: 9.5900, S: 0.09400 },
            85: { L: 0.0400, M: 10.6100, S: 0.09600 },
            90: { L: 0.0300, M: 11.6700, S: 0.09800 },
            95: { L: 0.0100, M: 12.7800, S: 0.10000 },
            100: { L: -0.0100, M: 13.9500, S: 0.10200 },
            105: { L: -0.0300, M: 15.2100, S: 0.10500 },
            110: { L: -0.0500, M: 16.6100, S: 0.10800 },
            115: { L: -0.0700, M: 18.1700, S: 0.11100 },
            120: { L: -0.0900, M: 19.9000, S: 0.11500 }
        },
        // Weight-for-height (WHZ) - Girls
        wfh_girls: {
            45: { L: -0.3833, M: 2.3300, S: 0.09030 },
            50: { L: -0.1800, M: 3.1700, S: 0.08800 },
            55: { L: -0.0800, M: 4.1800, S: 0.08700 },
            60: { L: -0.0200, M: 5.2500, S: 0.08700 },
            65: { L: 0.0200, M: 6.3100, S: 0.08800 },
            70: { L: 0.0400, M: 7.3100, S: 0.09000 },
            75: { L: 0.0400, M: 8.2500, S: 0.09200 },
            80: { L: 0.0400, M: 9.1900, S: 0.09500 },
            85: { L: 0.0300, M: 10.1900, S: 0.09800 },
            90: { L: 0.0100, M: 11.2500, S: 0.10100 },
            95: { L: -0.0100, M: 12.3700, S: 0.10400 },
            100: { L: -0.0300, M: 13.5600, S: 0.10700 },
            105: { L: -0.0500, M: 14.8500, S: 0.11000 },
            110: { L: -0.0700, M: 16.2700, S: 0.11400 },
            115: { L: -0.0900, M: 17.8500, S: 0.11700 },
            120: { L: -0.1100, M: 19.6000, S: 0.12100 }
        }
    },

    /**
     * Calculate Z-score using LMS method
     * Z = [(measurement/M)^L - 1] / (L × S) when L ≠ 0
     * Z = ln(measurement/M) / S when L = 0
     */
    calculateZScore(measurement, L, M, S) {
        if (L === 0) {
            return Math.log(measurement / M) / S;
        }
        return (Math.pow(measurement / M, L) - 1) / (L * S);
    },

    /**
     * Get nearest age bracket (in months)
     */
    getNearestAgeBracket(ageMonths) {
        const brackets = [0, 3, 6, 12, 24, 36, 48, 60];
        return brackets.reduce((prev, curr) =>
            Math.abs(curr - ageMonths) < Math.abs(prev - ageMonths) ? curr : prev
        );
    },

    /**
     * Get nearest height bracket (in cm)
     */
    getNearestHeightBracket(heightCm) {
        const brackets = [45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115, 120];
        return brackets.reduce((prev, curr) =>
            Math.abs(curr - heightCm) < Math.abs(prev - heightCm) ? curr : prev
        );
    },

    /**
     * Calculate Weight-for-Age Z-score (WAZ)
     */
    calculateWAZ(weightKg, ageMonths, gender) {
        const ageBracket = this.getNearestAgeBracket(ageMonths);
        const standards = gender === 'Male' ? this.WHO_STANDARDS.wfa_boys : this.WHO_STANDARDS.wfa_girls;
        const { L, M, S } = standards[ageBracket];
        return this.calculateZScore(weightKg, L, M, S);
    },

    /**
     * Calculate Height-for-Age Z-score (HAZ)
     */
    calculateHAZ(heightCm, ageMonths, gender) {
        const ageBracket = this.getNearestAgeBracket(ageMonths);
        const standards = gender === 'Male' ? this.WHO_STANDARDS.hfa_boys : this.WHO_STANDARDS.hfa_girls;
        const { L, M, S } = standards[ageBracket];
        return this.calculateZScore(heightCm, L, M, S);
    },

    /**
     * Calculate Weight-for-Height Z-score (WHZ)
     */
    calculateWHZ(weightKg, heightCm, gender) {
        const heightBracket = this.getNearestHeightBracket(heightCm);
        const standards = gender === 'Male' ? this.WHO_STANDARDS.wfh_boys : this.WHO_STANDARDS.wfh_girls;

        if (!standards[heightBracket]) {
            // Height outside normal range for WHZ
            return null;
        }

        const { L, M, S } = standards[heightBracket];
        return this.calculateZScore(weightKg, L, M, S);
    },

    /**
     * Calculate BMI-for-Age Z-score (BAZ)
     * Simplified calculation based on BMI
     */
    calculateBAZ(weightKg, heightCm, ageMonths, gender) {
        const bmi = weightKg / Math.pow(heightCm / 100, 2);
        // Using WAZ median as approximation for BMI median
        const ageBracket = this.getNearestAgeBracket(ageMonths);
        const standards = gender === 'Male' ? this.WHO_STANDARDS.wfa_boys : this.WHO_STANDARDS.wfa_girls;

        // Approximate BAZ using modified calculation
        const expectedBMI = gender === 'Male' ? 16.5 : 16.3; // Average BMI for children
        const bmiSD = 1.5; // Approximate SD
        return (bmi - expectedBMI) / bmiSD;
    },

    /**
     * Classify nutritional status based on WHO guidelines
     */
    classifyNutritionalStatus(waz, haz, whz) {
        const status = {
            wasting: 'Normal',
            stunting: 'Normal',
            underweight: 'Normal',
            overall: 'Normal',
            severity: 'none',
            recommendations: []
        };

        // Wasting (acute malnutrition) - based on WHZ
        if (whz !== null) {
            if (whz < -3) {
                status.wasting = 'Severe Acute Malnutrition (SAM)';
                status.severity = 'critical';
                status.recommendations.push('Urgent: Refer to health center immediately');
                status.recommendations.push('May require therapeutic feeding');
            } else if (whz < -2) {
                status.wasting = 'Moderate Acute Malnutrition (MAM)';
                status.severity = 'high';
                status.recommendations.push('Increase calorie-dense foods');
                status.recommendations.push('Monitor weekly');
            } else if (whz > 2) {
                status.wasting = 'Overweight';
                status.severity = 'moderate';
                status.recommendations.push('Reduce sugary foods and snacks');
            } else if (whz > 3) {
                status.wasting = 'Obese';
                status.severity = 'high';
                status.recommendations.push('Consult pediatrician for weight management');
            }
        }

        // Stunting (chronic malnutrition) - based on HAZ
        if (haz < -3) {
            status.stunting = 'Severe Stunting';
            status.severity = Math.max(status.severity === 'critical' ? 'critical' : 'high');
            status.recommendations.push('Focus on protein-rich foods');
            status.recommendations.push('Ensure adequate micronutrients (Zinc, Vitamin A)');
        } else if (haz < -2) {
            status.stunting = 'Moderate Stunting';
            status.recommendations.push('Improve diet quality with diverse foods');
        }

        // Underweight - based on WAZ
        if (waz < -3) {
            status.underweight = 'Severely Underweight';
            status.recommendations.push('Increase meal frequency (5-6 times/day)');
        } else if (waz < -2) {
            status.underweight = 'Moderately Underweight';
            status.recommendations.push('Add ghee/oil to meals for extra calories');
        }

        // Determine overall status
        if (status.wasting.includes('SAM') || status.stunting === 'Severe Stunting') {
            status.overall = 'Severe Acute Malnutrition';
        } else if (status.wasting.includes('MAM') || status.stunting === 'Moderate Stunting') {
            status.overall = 'Moderate Acute Malnutrition';
        } else if (status.wasting === 'Overweight' || status.wasting === 'Obese') {
            status.overall = status.wasting;
        }

        return status;
    },

    /**
     * Calculate all Z-scores and classification
     */
    analyzeGrowth(weightKg, heightCm, ageMonths, gender) {
        const waz = this.calculateWAZ(weightKg, ageMonths, gender);
        const haz = this.calculateHAZ(heightCm, ageMonths, gender);
        const whz = this.calculateWHZ(weightKg, heightCm, gender);
        const baz = this.calculateBAZ(weightKg, heightCm, ageMonths, gender);
        const bmi = Utils.calculateBMI(weightKg, heightCm);

        const classification = this.classifyNutritionalStatus(waz, haz, whz);

        return {
            measurements: {
                weight: weightKg,
                height: heightCm,
                bmi: parseFloat(bmi),
                ageMonths
            },
            zScores: {
                waz: Math.round(waz * 100) / 100,
                haz: Math.round(haz * 100) / 100,
                whz: whz ? Math.round(whz * 100) / 100 : null,
                baz: Math.round(baz * 100) / 100
            },
            interpretation: {
                waz: this.interpretZScore(waz, 'Weight-for-Age'),
                haz: this.interpretZScore(haz, 'Height-for-Age'),
                whz: whz ? this.interpretZScore(whz, 'Weight-for-Height') : 'N/A',
                baz: this.interpretZScore(baz, 'BMI-for-Age')
            },
            classification
        };
    },

    /**
     * Interpret individual Z-score
     */
    interpretZScore(zscore, indicator) {
        if (zscore < -3) return `Severely low ${indicator}`;
        if (zscore < -2) return `Low ${indicator}`;
        if (zscore < -1) return `Below average ${indicator}`;
        if (zscore <= 1) return `Normal ${indicator}`;
        if (zscore <= 2) return `Above average ${indicator}`;
        if (zscore <= 3) return `High ${indicator}`;
        return `Very high ${indicator}`;
    },

    /**
     * Get Z-score color for visualization
     */
    getZScoreColor(zscore) {
        if (zscore < -3) return '#dc2626'; // Red - Critical
        if (zscore < -2) return '#f97316'; // Orange - Warning
        if (zscore < -1) return '#eab308'; // Yellow - Below normal
        if (zscore <= 1) return '#22c55e';  // Green - Normal
        if (zscore <= 2) return '#eab308';  // Yellow - Above normal
        if (zscore <= 3) return '#f97316';  // Orange - High
        return '#dc2626'; // Red - Very high
    }
};

// Make GrowthModule available globally
window.GrowthModule = GrowthModule;
