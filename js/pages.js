/**
 * Pages Module - UI Components for all features
 */
const Pages = {

    /**
     * Render Growth Entry Page
     */
    renderGrowthEntry(child) {
        return `
            <div class="container-md">
                <div class="d-flex align-center gap-2 mb-4">
                    <button onclick="App.navigate('child-profile', {id: ${child.id}})" class="btn btn-secondary btn-sm">
                        ← Back
                    </button>
                    <h1 style="margin: 0;">Add Growth Record</h1>
                </div>
                
                <div class="grid grid-2">
                    <div class="card">
                        <h3 class="card-title">📏 Record Measurements</h3>
                        <p class="text-muted">For: <strong>${Utils.escapeHtml(child.name)}</strong> (${Utils.formatAge(child.dob)})</p>
                        
                        <form id="growth-form" class="mt-4">
                            <div class="form-group">
                                <label class="form-label" for="record-date">Date of Measurement *</label>
                                <input type="date" id="record-date" name="recorded_date" class="form-control" 
                                       value="${new Date().toISOString().split('T')[0]}" 
                                       max="${new Date().toISOString().split('T')[0]}" required>
                            </div>
                            
                            <div class="grid grid-2">
                                <div class="form-group">
                                    <label class="form-label" for="height">Height (cm) *</label>
                                    <input type="number" id="height" name="height_cm" class="form-control" 
                                           step="0.1" min="30" max="200" placeholder="e.g., 75.5" required>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label" for="weight">Weight (kg) *</label>
                                    <input type="number" id="weight" name="weight_kg" class="form-control" 
                                           step="0.1" min="1" max="100" placeholder="e.g., 9.5" required>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label" for="head-circ">Head Circumference (cm) - Optional</label>
                                <input type="number" id="head-circ" name="head_circumference_cm" class="form-control" 
                                       step="0.1" min="20" max="60" placeholder="For infants under 2 years">
                            </div>
                            
                            <button type="submit" class="btn btn-success btn-lg btn-block mt-4">
                                Analyze & Save
                            </button>
                        </form>
                    </div>
                    
                    <div id="growth-analysis" class="card" style="display: none;">
                        <h3 class="card-title">📊 AI Analysis Results</h3>
                        <div id="analysis-content"></div>
                    </div>
                </div>
                
                <!-- Growth History -->
                <div class="card mt-4">
                    <h3 class="card-title">📈 Growth History</h3>
                    <div id="growth-history">
                        ${this.renderGrowthHistory(child.growthRecords || [])}
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Render Growth History Table
     */
    renderGrowthHistory(records) {
        if (!records || records.length === 0) {
            return '<p class="text-muted text-center">No growth records yet.</p>';
        }

        return `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Height</th>
                            <th>Weight</th>
                            <th>BMI</th>
                            <th>WAZ</th>
                            <th>HAZ</th>
                            <th>WHZ</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${records.map(r => `
                            <tr>
                                <td>${Utils.formatDate(r.recorded_date)}</td>
                                <td>${r.height_cm} cm</td>
                                <td>${r.weight_kg} kg</td>
                                <td>${Utils.calculateBMI(r.weight_kg, r.height_cm)}</td>
                                <td><span style="color: ${GrowthModule.getZScoreColor(r.waz_score || 0)}">${r.waz_score !== null && r.waz_score !== undefined ? Number(r.waz_score).toFixed(2) : '-'}</span></td>
                                <td><span style="color: ${GrowthModule.getZScoreColor(r.haz_score || 0)}">${r.haz_score !== null && r.haz_score !== undefined ? Number(r.haz_score).toFixed(2) : '-'}</span></td>
                                <td><span style="color: ${GrowthModule.getZScoreColor(r.whz_score || 0)}">${r.whz_score !== null && r.whz_score !== undefined ? Number(r.whz_score).toFixed(2) : '-'}</span></td>
                                <td>${Utils.getStatusBadge(r.assessment_result || 'Normal')}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    /**
     * Render Growth Analysis Result
     */
    renderGrowthAnalysis(analysis) {
        const { measurements, zScores, interpretation, classification } = analysis;

        return `
            <div class="mb-4">
                <h4>Z-Score Results</h4>
                <div class="grid grid-2 gap-2">
                    <div class="d-flex justify-between p-2" style="background: var(--bg-tertiary); border-radius: 8px;">
                        <span>Weight-for-Age (WAZ)</span>
                        <strong style="color: ${GrowthModule.getZScoreColor(zScores.waz)}">${zScores.waz}</strong>
                    </div>
                    <div class="d-flex justify-between p-2" style="background: var(--bg-tertiary); border-radius: 8px;">
                        <span>Height-for-Age (HAZ)</span>
                        <strong style="color: ${GrowthModule.getZScoreColor(zScores.haz)}">${zScores.haz}</strong>
                    </div>
                    <div class="d-flex justify-between p-2" style="background: var(--bg-tertiary); border-radius: 8px;">
                        <span>Weight-for-Height (WHZ)</span>
                        <strong style="color: ${GrowthModule.getZScoreColor(zScores.whz || 0)}">${zScores.whz || 'N/A'}</strong>
                    </div>
                    <div class="d-flex justify-between p-2" style="background: var(--bg-tertiary); border-radius: 8px;">
                        <span>BMI-for-Age (BAZ)</span>
                        <strong style="color: ${GrowthModule.getZScoreColor(zScores.baz)}">${zScores.baz}</strong>
                    </div>
                </div>
            </div>
            
            <div class="mb-4">
                <h4>Assessment</h4>
                <div class="alert alert-${classification.severity === 'critical' ? 'danger' : classification.severity === 'high' ? 'warning' : 'success'}">
                    <strong>Overall: ${classification.overall}</strong>
                    ${classification.wasting !== 'Normal' ? `<br>Wasting: ${classification.wasting}` : ''}
                    ${classification.stunting !== 'Normal' ? `<br>Stunting: ${classification.stunting}` : ''}
                    ${classification.underweight !== 'Normal' ? `<br>Underweight: ${classification.underweight}` : ''}
                </div>
            </div>
            
            ${classification.recommendations.length > 0 ? `
                <div>
                    <h4>Recommendations</h4>
                    <ul class="text-muted">
                        ${classification.recommendations.map(r => `<li>${r}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
        `;
    },

    /**
     * Render Blood Report Entry Page
     */
    renderBloodReport(child, reports = []) {
        return `
            <div class="container-md">
                <div class="d-flex align-center gap-2 mb-4">
                    <button onclick="App.navigate('child-profile', {id: ${child.id}})" class="btn btn-secondary btn-sm">
                        ← Back
                    </button>
                    <h1 style="margin: 0;">Blood Report Analysis</h1>
                </div>
                
                <div class="grid grid-2">
                    <div class="card">
                        <h3 class="card-title">🩸 Enter Blood Test Values</h3>
                        <p class="text-muted">For: <strong>${Utils.escapeHtml(child.name)}</strong> (${Utils.formatAge(child.dob)})</p>
                        
                        <form id="blood-form" class="mt-4">
                            <div class="grid grid-2">
                                <div class="form-group">
                                    <label class="form-label" for="test-date">Test Date *</label>
                                    <input type="date" id="test-date" name="test_date" class="form-control" 
                                           value="${new Date().toISOString().split('T')[0]}" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label" for="lab-name">Lab Name</label>
                                    <input type="text" id="lab-name" name="lab_name" class="form-control" 
                                           placeholder="Optional">
                                </div>
                            </div>
                            
                            <hr class="my-4">
                            <h4>Blood Parameters</h4>
                            <p class="text-muted" style="font-size: 0.85rem;">Enter available values from the lab report. Leave empty if not tested.</p>
                            
                            <div class="grid grid-2">
                                <div class="form-group">
                                    <label class="form-label" for="hemoglobin">Hemoglobin (g/dL)</label>
                                    <input type="number" id="hemoglobin" name="hemoglobin" class="form-control" 
                                           step="0.1" min="0" max="25" placeholder="e.g., 12.5">
                                </div>
                                <div class="form-group">
                                    <label class="form-label" for="serum_iron">Serum Iron (µg/dL)</label>
                                    <input type="number" id="serum_iron" name="serum_iron" class="form-control" 
                                           step="1" min="0" max="500" placeholder="e.g., 80">
                                </div>
                            </div>
                            
                            <div class="grid grid-2">
                                <div class="form-group">
                                    <label class="form-label" for="vitamin_d">Vitamin D (ng/mL)</label>
                                    <input type="number" id="vitamin_d" name="vitamin_d" class="form-control" 
                                           step="0.1" min="0" max="200" placeholder="e.g., 30">
                                </div>
                                <div class="form-group">
                                    <label class="form-label" for="vitamin_b12">Vitamin B12 (pg/mL)</label>
                                    <input type="number" id="vitamin_b12" name="vitamin_b12" class="form-control" 
                                           step="1" min="0" max="2000" placeholder="e.g., 400">
                                </div>
                            </div>
                            
                            <div class="grid grid-2">
                                <div class="form-group">
                                    <label class="form-label" for="calcium">Calcium (mg/dL)</label>
                                    <input type="number" id="calcium" name="calcium" class="form-control" 
                                           step="0.1" min="0" max="20" placeholder="e.g., 9.5">
                                </div>
                                <div class="form-group">
                                    <label class="form-label" for="ferritin">Ferritin (ng/mL)</label>
                                    <input type="number" id="ferritin" name="ferritin" class="form-control" 
                                           step="0.1" min="0" max="500" placeholder="e.g., 50">
                                </div>
                            </div>
                            
                            <div class="grid grid-2">
                                <div class="form-group">
                                    <label class="form-label" for="total_protein">Total Protein (g/dL)</label>
                                    <input type="number" id="total_protein" name="total_protein" class="form-control" 
                                           step="0.1" min="0" max="15" placeholder="e.g., 7.0">
                                </div>
                                <div class="form-group">
                                    <label class="form-label" for="albumin">Albumin (g/dL)</label>
                                    <input type="number" id="albumin" name="albumin" class="form-control" 
                                           step="0.1" min="0" max="10" placeholder="e.g., 4.0">
                                </div>
                            </div>
                            
                            <button type="submit" class="btn btn-primary btn-lg btn-block mt-4">
                                🔬 Analyze Report
                            </button>
                        </form>
                    </div>
                    
                    <div id="blood-analysis" class="card" style="display: none;">
                        <h3 class="card-title">🤖 AI Analysis Results</h3>
                        <div id="blood-analysis-content"></div>
                    </div>
                </div>
                
                <!-- Previous Reports -->
                <div class="card mt-4">
                    <h3 class="card-title">📋 Previous Blood Reports</h3>
                    <div id="blood-history">
                        ${this.renderBloodHistory(reports)}
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Render Blood History Table
     */
    renderBloodHistory(reports) {
        if (!reports || reports.length === 0) {
            return '<p class="text-muted text-center">No blood reports yet.</p>';
        }

        return `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Lab</th>
                            <th>Hb</th>
                            <th>Vit D</th>
                            <th>Vit B12</th>
                            <th>Calcium</th>
                            <th>Iron</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${reports.map(r => `
                            <tr>
                                <td>${Utils.formatDate(r.test_date)}</td>
                                <td class="text-muted">${Utils.escapeHtml(r.lab_name || '-')}</td>
                                <td>${r.hemoglobin || '-'}</td>
                                <td>${r.vitamin_d || '-'}</td>
                                <td>${r.vitamin_b12 || '-'}</td>
                                <td>${r.calcium || '-'}</td>
                                <td>${r.serum_iron || '-'}</td>
                                <td>${BloodAnalyzer.getStatusBadge(r.analysis_result).text}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    /**
     * Render Blood Analysis Results
     */
    renderBloodAnalysis(analysis, previousReport = null) {
        const alerts = BloodAnalyzer.generateParentAlert(analysis);
        const statusBadge = BloodAnalyzer.getStatusBadge(analysis.overallStatus);

        return `
            <div class="mb-4">
                <div class="d-flex align-center gap-2 mb-3">
                    <span class="badge badge-${statusBadge.class}" style="font-size: 1rem; padding: 0.5rem 1rem;">
                        ${statusBadge.text}
                    </span>
                </div>
            </div>
            
            ${alerts.map(alert => `
                <div class="alert alert-${alert.type === 'critical' ? 'danger' : alert.type === 'warning' ? 'warning' : 'info'} mb-3">
                    <div class="d-flex align-center gap-2 mb-2">
                        <span style="font-size: 1.5rem;">${alert.icon}</span>
                        <strong>${alert.title}</strong>
                    </div>
                    <p style="margin: 0 0 0.5rem 0;">${alert.message}</p>
                    <ul style="margin: 0; padding-left: 1.5rem;">
                        ${alert.details.map(d => `<li>${d}</li>`).join('')}
                    </ul>
                </div>
            `).join('')}
            
            <div class="mt-4">
                <h4>Parameter Details ${previousReport ? '<span class="text-muted" style="font-size: 0.8rem; font-weight: normal;">(vs Last Report)</span>' : ''}</h4>
                <div class="table-container">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Parameter</th>
                                <th>Current</th>
                                ${previousReport ? '<th>Previous</th>' : ''}
                                <th>Normal Range</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${analysis.parameters.map(p => {
            const badge = BloodAnalyzer.getStatusBadge(p.status);
            const prevValue = previousReport ? previousReport[p.parameter] : null;
            let trend = '';
            if (prevValue !== null && prevValue !== undefined) {
                if (p.value > prevValue) trend = ' <span class="text-success">↑</span>';
                else if (p.value < prevValue) trend = ' <span class="text-danger">↓</span>';
            }

            return `
                                    <tr>
                                        <td>${p.name}</td>
                                        <td><strong>${p.value} ${p.unit}</strong>${trend}</td>
                                        ${previousReport ? `<td>${prevValue !== null && prevValue !== undefined ? prevValue + ' ' + p.unit : '-'}</td>` : ''}
                                        <td>${p.range.low_normal} - ${p.range.high_normal} ${p.unit}</td>
                                        <td><span class="badge badge-${badge.class}">${badge.text}</span></td>
                                    </tr>
                                `;
        }).join('')}
                        </tbody>
                    </table>
                </div>
                ${previousReport ? `
                    <p class="text-muted mt-2" style="font-size: 0.8rem;">
                        * Previous report date: ${Utils.formatDate(previousReport.test_date)}
                    </p>
                ` : ''}
            </div>
        `;
    },

    /**
     * Render Vaccination Tracker Page
     */
    renderVaccinations(child, vaccinations) {
        const pending = vaccinations.filter(v => v.status === 'pending');
        const overdue = pending.filter(v => new Date(v.alert_start_date) < new Date());
        const upcoming = pending.filter(v => new Date(v.alert_start_date) >= new Date());
        const completed = vaccinations.filter(v => v.status === 'completed');

        return `
            <div class="container-lg">
                <div class="d-flex align-center gap-2 mb-4">
                    <button onclick="App.navigate('child-profile', {id: ${child.id}})" class="btn btn-secondary btn-sm">
                        ← Back
                    </button>
                    <h1 style="margin: 0;">Vaccination Tracker</h1>
                </div>
                
                <p class="text-muted mb-4">For: <strong>${Utils.escapeHtml(child.name)}</strong> (${Utils.formatAge(child.dob)})</p>
                
                <!-- Stats -->
                <div class="stats-grid mb-4">
                    <div class="stat-card">
                        <div class="stat-icon success">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                <polyline points="22 4 12 14.01 9 11.01"/>
                            </svg>
                        </div>
                        <div class="stat-content">
                            <h3>${completed.length}</h3>
                            <p>Completed</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon warning">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"/>
                                <polyline points="12 6 12 12 16 14"/>
                            </svg>
                        </div>
                        <div class="stat-content">
                            <h3>${upcoming.length}</h3>
                            <p>Upcoming</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon danger">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="12" y1="8" x2="12" y2="12"/>
                                <line x1="12" y1="16" x2="12.01" y2="16"/>
                            </svg>
                        </div>
                        <div class="stat-content">
                            <h3>${overdue.length}</h3>
                            <p>Overdue</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon primary">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                            </svg>
                        </div>
                        <div class="stat-content">
                            <h3>${Math.round((completed.length / vaccinations.length) * 100)}%</h3>
                            <p>Complete</p>
                        </div>
                    </div>
                </div>
                
                ${overdue.length > 0 ? `
                    <div class="card mb-4" style="border-left: 4px solid var(--danger);">
                        <h3 class="card-title" style="color: var(--danger);">⚠️ Overdue Vaccinations</h3>
                        ${this.renderVaccinationList(overdue, child.id, 'overdue')}
                    </div>
                ` : ''}
                
                ${upcoming.length > 0 ? `
                    <div class="card mb-4" style="border-left: 4px solid var(--warning);">
                        <h3 class="card-title">📅 Upcoming Vaccinations</h3>
                        ${this.renderVaccinationList(upcoming, child.id, 'upcoming')}
                    </div>
                ` : ''}
                
                <div class="card">
                    <h3 class="card-title" style="color: var(--success);">✅ Completed Vaccinations</h3>
                    ${this.renderVaccinationList(completed, child.id, 'completed')}
                </div>
            </div>
        `;
    },

    /**
     * Render Vaccination List
     */
    renderVaccinationList(vaccinations, childId, type) {
        if (vaccinations.length === 0) {
            return '<p class="text-muted">No vaccinations in this category.</p>';
        }

        return `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Vaccine</th>
                            <th>Dose</th>
                            <th>Disease Prevented</th>
                            <th>${type === 'completed' ? 'Completed Date' : 'Due Date'}</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${vaccinations.map(v => `
                            <tr>
                                <td><strong>${Utils.escapeHtml(v.vaccine_name)}</strong></td>
                                <td>${Utils.escapeHtml(v.dose || '-')}</td>
                                <td class="text-muted">${Utils.escapeHtml(v.disease_prevented || '-')}</td>
                                <td>
                                    ${type === 'completed'
                ? Utils.formatDate(v.completed_date)
                : `<div class="d-flex flex-column">
                     <span class="${type === 'overdue' ? 'text-danger' : ''}">${Utils.formatDate(v.alert_start_date)}</span>
                     ${type === 'overdue' ? (function() {
                         const daysOverdue = Math.floor((new Date() - new Date(v.deadline_date)) / (1000 * 60 * 60 * 24));
                         if (daysOverdue > 10) return '<span class="badge badge-danger" style="font-size: 0.7rem; margin-top: 0.25rem;">Critical (L2)</span>';
                         if (daysOverdue > 0) return '<span class="badge badge-warning" style="font-size: 0.7rem; margin-top: 0.25rem;">Escalated (L1)</span>';
                         return '<span class="badge badge-secondary" style="font-size: 0.7rem; margin-top: 0.25rem;">Overdue</span>';
                     })() : ''}
                   </div>`
            }
                                </td>
                                <td>
                                    ${type !== 'completed' ? `
                                        <button onclick="Pages.markVaccinationComplete(${childId}, ${v.id})" 
                                                class="btn btn-sm btn-success">
                                            Mark Complete
                                        </button>
                                    ` : `
                                        <span class="badge badge-success">Done</span>
                                    `}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    /**
     * Render Nutrition Recommendations Page
     */
    renderNutrition(child, recommendations) {
        return `
            <div class="container-lg">
                <div class="d-flex align-center gap-2 mb-4">
                    <button onclick="App.navigate('child-profile', {id: ${child.id}})" class="btn btn-secondary btn-sm">
                        ← Back
                    </button>
                    <h1 style="margin: 0;">Nutrition Recommendations</h1>
                </div>
                
                <p class="text-muted mb-4">For: <strong>${Utils.escapeHtml(child.name)}</strong> (${Utils.formatAge(child.dob)})</p>
                
                ${recommendations.deficiency_plans?.length > 0 ? `
                    <div class="alert alert-warning mb-4">
                        <strong>Based on recent assessments, these plans address identified deficiencies:</strong>
                    </div>
                ` : ''}
                
                <!-- Deficiency-based Plans -->
                ${(recommendations.deficiency_plans || []).map(plan => `
                    <div class="card mb-4" style="border-left: 4px solid var(--warning);">
                        <h3 class="card-title">🎯 ${plan.category} - ${plan.age_group}</h3>
                        <p class="text-muted">${plan.deficiency_target}</p>
                        <hr>
                        <h4>Meal Plan</h4>
                        <p>${plan.meal_plan}</p>
                        <h4>Recommended Foods</h4>
                        <div class="d-flex flex-wrap gap-1">
                            ${plan.foods_list.map(f => `
                                <span class="badge badge-success" style="font-size: 0.9rem;">${f}</span>
                            `).join('')}
                        </div>
                        <p class="mt-3 text-muted">Estimated daily cost: <strong>₹${plan.estimated_daily_cost}</strong></p>
                    </div>
                `).join('')}
                
                <!-- General Plan -->
                <div class="card mb-4">
                    <h3 class="card-title">🍽️ General Nutrition Guidelines</h3>
                    ${this.renderGeneralNutritionPlan(Utils.ageInMonths(child.dob))}
                </div>
                
                <!-- Kerala Foods Reference -->
                <div class="card">
                    <h3 class="card-title">🥥 Kerala Nutrition Guide</h3>
                    <p class="text-muted mb-4">Affordable, locally available foods rich in essential nutrients</p>
                    
                    <div class="grid grid-2">
                        <div>
                            <h4 style="color: var(--danger);">🩸 Iron-Rich Foods</h4>
                            <ul>
                                <li>Ragi (റാഗി) - ₹60/kg</li>
                                <li>Drumstick leaves (മുരിങ്ങയില) - ₹40/kg</li>
                                <li>Dates (കാരക്ക) - ₹200/kg</li>
                                <li>Jaggery (ശർക്കര) - ₹100/kg</li>
                            </ul>
                        </div>
                        
                        <div>
                            <h4 style="color: var(--primary);">💪 Protein-Rich Foods</h4>
                            <ul>
                                <li>Egg (മുട്ട) - ₹7/unit</li>
                                <li>Sardine/Mathi (മത്തി) - ₹200/kg</li>
                                <li>Moong Dal (ചെറുപയർ) - ₹120/kg</li>
                                <li>Groundnuts (കപ്പലണ്ടി) - ₹150/kg</li>
                            </ul>
                        </div>
                        
                        <div>
                            <h4 style="color: var(--success);">🦴 Calcium-Rich Foods</h4>
                            <ul>
                                <li>Milk (പാൽ) - ₹55/L</li>
                                <li>Sesame seeds (എള്ള്) - ₹200/kg</li>
                                <li>Ragi (റാഗി) - ₹60/kg</li>
                                <li>Curd (തൈര്) - ₹60/kg</li>
                            </ul>
                        </div>
                        
                        <div>
                            <h4 style="color: var(--warning);">☀️ Vitamin A Foods</h4>
                            <ul>
                                <li>Papaya (പപ്പായ) - ₹30/kg</li>
                                <li>Carrot (കാരറ്റ്) - ₹50/kg</li>
                                <li>Sweet Potato (മധുരക്കിഴങ്ങ്) - ₹40/kg</li>
                                <li>Mango (മാങ്ങ) - Seasonal</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Render General Nutrition Plan by Age
     */
    renderGeneralNutritionPlan(ageMonths) {
        let plan;

        if (ageMonths < 6) {
            plan = {
                title: 'Exclusive Breastfeeding (0-6 months)',
                meals: ['Breast milk only (8-12 times/day)', 'No water or other foods needed']
            };
        } else if (ageMonths < 12) {
            plan = {
                title: 'Introduction to Solids (6-12 months)',
                meals: [
                    'Morning: Breast milk + Rice kanji/Ragi porridge',
                    'Mid-morning: Mashed banana',
                    'Lunch: Dal water with rice',
                    'Evening: Breast milk',
                    'Night: Vegetable puree + Breast milk'
                ]
            };
        } else if (ageMonths < 36) {
            plan = {
                title: 'Toddler Diet (1-3 years)',
                meals: [
                    'Breakfast: Idli/Dosa with sambar',
                    'Mid-morning: Fruit (banana/papaya)',
                    'Lunch: Rice + Sambar + Thoran + Egg/Fish',
                    'Snack: Milk + Biscuit',
                    'Dinner: Chapati/Appam with curry'
                ]
            };
        } else {
            plan = {
                title: 'Pre-school Diet (3+ years)',
                meals: [
                    'Breakfast: Puttu/Appam with curry + Milk',
                    'Mid-morning: Fruit/Nuts',
                    'Lunch: Rice + Sambar + Vegetable + Fish/Egg',
                    'Snack: Avalose podi/Pazham pori',
                    'Dinner: Chapati with dal + Milk'
                ]
            };
        }

        return `
            <h4>${plan.title}</h4>
            <ul>
                ${plan.meals.map(m => `<li>${m}</li>`).join('')}
            </ul>
        `;
    },

    /**
     * Mark Vaccination as Complete
     */
    async markVaccinationComplete(childId, vaccinationId) {
        try {
            Utils.showLoading();
            await API.vaccinations.markComplete(childId, vaccinationId, {
                completed_date: new Date().toISOString().split('T')[0]
            });
            Utils.showToast('Vaccination marked as complete!', 'success');
            App.navigate('vaccinations', { id: childId });
        } catch (error) {
            Utils.showToast(error.message || 'Failed to update', 'error');
        } finally {
            Utils.hideLoading();
        }
    },

    /**
     * Initialize Growth Form Handler
     */
    initGrowthForm(child) {
        const form = document.getElementById('growth-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const heightCm = parseFloat(document.getElementById('height').value);
            const weightKg = parseFloat(document.getElementById('weight').value);
            const recordedDate = document.getElementById('record-date').value;
            const headCirc = document.getElementById('head-circ').value;

            // Calculate age at time of measurement
            const ageMonths = Utils.ageInMonths(child.dob);

            // Run AI analysis
            const analysis = GrowthModule.analyzeGrowth(weightKg, heightCm, ageMonths, child.gender);

            // Show analysis results
            const analysisDiv = document.getElementById('growth-analysis');
            const analysisContent = document.getElementById('analysis-content');
            analysisDiv.style.display = 'block';
            analysisContent.innerHTML = Pages.renderGrowthAnalysis(analysis);

            // Save to backend
            try {
                await API.growth.add(child.id, {
                    recorded_date: recordedDate,
                    height_cm: heightCm,
                    weight_kg: weightKg,
                    head_circumference_cm: headCirc || null,
                    waz_score: analysis.zScores.waz,
                    haz_score: analysis.zScores.haz,
                    whz_score: analysis.zScores.whz,
                    baz_score: analysis.zScores.baz,
                    assessment_result: analysis.classification.overall
                });
                Utils.showToast('Growth record saved!', 'success');
            } catch (error) {
                Utils.showToast(error.message || 'Failed to save', 'error');
            }
        });
    },

    /**
     * Initialize Blood Report Form Handler
     */
    initBloodForm(child, reports = []) {
        const form = document.getElementById('blood-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(form);
            const reportData = {};

            formData.forEach((value, key) => {
                if (value && value !== '') {
                    reportData[key] = key === 'test_date' || key === 'lab_name' ? value : parseFloat(value);
                }
            });

            const ageMonths = Utils.ageInMonths(child.dob);

            // Run AI analysis
            const analysis = BloodAnalyzer.analyzeReport(reportData, ageMonths, child.gender);

            // Get last report for comparison
            const lastReport = reports.length > 0 ? reports[0] : null;

            // Show analysis results
            const analysisDiv = document.getElementById('blood-analysis');
            const analysisContent = document.getElementById('blood-analysis-content');
            analysisDiv.style.display = 'block';
            analysisContent.innerHTML = Pages.renderBloodAnalysis(analysis, lastReport);

            // Save to backend
            try {
                await API.blood.add(child.id, {
                    ...reportData,
                    analysis_result: analysis.overallStatus,
                    recommendations: JSON.stringify(analysis.recommendations)
                });
                Utils.showToast('Blood report saved!', 'success');

                // Refresh history if needed or just show success
                // App.navigate('blood-report', { id: child.id }); 
            } catch (error) {
                Utils.showToast(error.message || 'Failed to save', 'error');
            }
        });
    }
};

// Make Pages available globally
window.Pages = Pages;
