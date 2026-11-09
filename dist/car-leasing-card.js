/*
 * Car Leasing Card for Home Assistant
 * ====================================
 * A Lovelace card that tracks mileage usage against a car leasing contract,
 * showing progress toward the yearly allowance and estimated extra-km costs.
 *
 * License: MIT
 *
 */

const CARD_VERSION = "1.0.8";

/* ---------------------------------------------------------------------- */
/*  Main card                                                             */
/* ---------------------------------------------------------------------- */
class CarLeasingCard extends HTMLElement {
	static TRANSLATIONS = {
		en: {
			title: "Car Leasing",
			current_mileage: "Current mileage",
			driven: "Driven since start",
			total_allowed: "Total allowed",
			expected_today: "Expected by today",
			remaining: "Remaining",
			days_left: "Days left",
			contract_ended: "Contract ended",
			status_on_track: "On track",
			status_ahead: "Ahead of pace",
			status_over: "Over limit",
			extra_km: "Extra km",
			extra_cost: "Estimated extra cost",
			contract_ends: "Ends",
			not_available: "Entity not available",
			check_config: "Check the card configuration (dates or entity).",
			year_marker: "End of year {n}",
		},
		fr: {
			title: "Suivi du leasing",
			current_mileage: "Kilométrage actuel",
			driven: "Parcouru depuis le début",
			total_allowed: "Total autorisé",
			expected_today: "Attendu à ce jour",
			remaining: "Restant",
			days_left: "Jours restants",
			contract_ended: "Contrat terminé",
			status_on_track: "Dans les clous",
			status_ahead: "Rythme trop rapide",
			status_over: "Dépassement",
			extra_km: "Km supplémentaires",
			extra_cost: "Coût supplémentaire estimé",
			contract_ends: "Fin",
			not_available: "Entité non disponible",
			check_config: "Vérifiez la configuration de la carte (dates ou entité).",
			year_marker: "Fin d'année {n}",
		},
		de: {
			title: "Leasing-Übersicht",
			current_mileage: "Aktueller Kilometerstand",
			driven: "Gefahren seit Start",
			total_allowed: "Gesamt erlaubt",
			expected_today: "Erwartet bis heute",
			remaining: "Verbleibend",
			days_left: "Verbleibende Tage",
			contract_ended: "Vertrag beendet",
			status_on_track: "Im Plan",
			status_ahead: "Zu schnelles Tempo",
			status_over: "Überschritten",
			extra_km: "Mehrkilometer",
			extra_cost: "Geschätzte Mehrkosten",
			contract_ends: "Ende",
			not_available: "Entität nicht verfügbar",
			check_config: "Prüfen Sie die Kartenkonfiguration (Daten oder Entität).",
			year_marker: "Ende von Jahr {n}",
		},
		es: {
			title: "Seguimiento del leasing",
			current_mileage: "Kilometraje actual",
			driven: "Recorrido desde el inicio",
			total_allowed: "Total permitido",
			expected_today: "Esperado a día de hoy",
			remaining: "Restante",
			days_left: "Días restantes",
			contract_ended: "Contrato finalizado",
			status_on_track: "Dentro de lo previsto",
			status_ahead: "Ritmo demasiado alto",
			status_over: "Límite superado",
			extra_km: "Km adicionales",
			extra_cost: "Coste adicional estimado",
			contract_ends: "Fin",
			not_available: "Entidad no disponible",
			check_config: "Revisa la configuración de la tarjeta (fechas o entidad).",
			year_marker: "Fin del año {n}",
		},
		it: {
			title: "Monitoraggio leasing",
			current_mileage: "Chilometraggio attuale",
			driven: "Percorsi dall'inizio",
			total_allowed: "Totale consentito",
			expected_today: "Previsto ad oggi",
			remaining: "Rimanente",
			days_left: "Giorni rimanenti",
			contract_ended: "Contratto terminato",
			status_on_track: "In linea",
			status_ahead: "Ritmo troppo elevato",
			status_over: "Limite superato",
			extra_km: "Km extra",
			extra_cost: "Costo extra stimato",
			contract_ends: "Fine",
			not_available: "Entità non disponibile",
			check_config: "Controlla la configurazione della card (date o entità).",
			year_marker: "Fine anno {n}",
		},
		pt: {
			title: "Acompanhamento do leasing",
			current_mileage: "Quilometragem atual",
			driven: "Percorrido desde o início",
			total_allowed: "Total permitido",
			expected_today: "Esperado até hoje",
			remaining: "Restante",
			days_left: "Dias restantes",
			contract_ended: "Contrato encerrado",
			status_on_track: "Dentro do previsto",
			status_ahead: "Ritmo acima do esperado",
			status_over: "Limite ultrapassado",
			extra_km: "Km extras",
			extra_cost: "Custo extra estimado",
			contract_ends: "Fim",
			not_available: "Entidade não disponível",
			check_config: "Verifique a configuração do card (datas ou entidade).",
			year_marker: "Fim do ano {n}",
		},
		nl: {
			title: "Leasing overzicht",
			current_mileage: "Huidige kilometerstand",
			driven: "Gereden sinds start",
			total_allowed: "Totaal toegestaan",
			expected_today: "Verwacht tot vandaag",
			remaining: "Resterend",
			days_left: "Dagen resterend",
			contract_ended: "Contract beëindigd",
			status_on_track: "Op schema",
			status_ahead: "Te hoog tempo",
			status_over: "Limiet overschreden",
			extra_km: "Extra km",
			extra_cost: "Geschatte extra kosten",
			contract_ends: "Einde",
			not_available: "Entiteit niet beschikbaar",
			check_config: "Controleer de kaartconfiguratie (datums of entiteit).",
			year_marker: "Einde van jaar {n}",
		},
	};

	static STATUS_COLORS = {
		on_track: {
			color: "#4caf50",
			bg: "rgba(76,175,80,0.15)"
		},
		ahead: {
			color: "#ff9800",
			bg: "rgba(255,152,0,0.15)"
		},
		over: {
			color: "#f44336",
			bg: "rgba(244,67,54,0.15)"
		},
	};

	static STATUS_MARKER_COLORS = {
		on_track: "#388e3c",
		ahead: "#e65100",
		over: "#b71c1c",
	};

	static FIELD_DEFAULTS = {
		start_mileage: 0,
		annual_allowance: 15000,
		ahead_tolerance_pct: 0,
		extra_km_cost: 0,
		currency: "€",
		language: "auto",
		vehicle_type: "sedan",
		vehicle_color: "#ffffff",
	};

	// Elements the user can show or hide. All are visible by default.
	// Config key: show_<name>: false hides the element.
	// Legacy key hide_<name>: true is still honoured for existing configs.
	static VISIBILITY_KEYS = [
		"title_icon",
		"title",
		"status_chip",
		"car_image",
		"progress_badge",
		"current_mileage",
		"driven",
		"expected_today",
		"remaining",
		"days_left",
		"contract_ends",
		"extra_alert",
	];

	static NUMBER_SEPARATORS = {
		comma_decimal: { group: ",", decimal: "." },
		decimal_comma: { group: ".", decimal: "," },
		space_comma: { group: " ", decimal: "," },
	};

	// Listed in alphabetical order of the label (the order shown in the editor).
	static VEHICLE_TYPES = [
		{ value: "camper-van", label: "Camper van" },
		{ value: "caravan", label: "Caravan" },
		{ value: "cargo-van", label: "Cargo van" },
		{ value: "segment-a", label: "City car" },
		{ value: "compact", label: "Compact hatchback" },
		{ value: "european-delivery-truck", label: "Delivery truck" },
		{ value: "e-bike", label: "Electric bike" },
		{ value: "estate-car", label: "Estate car" },
		{ value: "micro", label: "Micro car" },
		{ value: "motorcycle-roadster", label: "Motorcycle (roadster)" },
		{ value: "motorhome", label: "Motorhome" },
		{ value: "mpv", label: "MPV" },
		{ value: "pickup-truck", label: "Pickup truck" },
		{ value: "scooter", label: "Scooter" },
		{ value: "sedan", label: "Sedan" },
		{ value: "suv", label: "SUV" },
		{ value: "tesla-model3", label: "Tesla Model 3" },
	];

	// Sorted by label so the selector stays alphabetical when a type is added.
	static VEHICLE_TYPE_OPTIONS = CarLeasingCard.VEHICLE_TYPES
		.map(({ value, label }) => ({ value, label }))
		.sort((a, b) => a.label.localeCompare(b.label, "en", { sensitivity: "base" }));

	// Values used by earlier versions, mapped to the closest current illustration.
	static VEHICLE_TYPE_ALIASES = {
		cuv: "suv",
		van: "cargo-van",
		campervan: "camper-van",
		pickup: "pickup-truck",
	};

	static _resolveVehicleType(value) {
		const key = String(value ?? "").trim();
		if (CarLeasingCard.VEHICLE_TYPES.some((t) => t.value === key))
			return key;
		return Object.prototype.hasOwnProperty.call(CarLeasingCard.VEHICLE_TYPE_ALIASES, key)
			? CarLeasingCard.VEHICLE_TYPE_ALIASES[key]
			: CarLeasingCard.FIELD_DEFAULTS.vehicle_type;
	}

	// Only #rgb and #rrggbb are accepted: the value ends up in a style attribute.
	static _safeColor(value) {
		let v = String(value ?? "").trim().toLowerCase();
		if (/^#[0-9a-f]{3}$/.test(v))
			v = "#" + [...v.slice(1)].map((c) => c + c).join("");
		return /^#[0-9a-f]{6}$/.test(v) ? v : CarLeasingCard.FIELD_DEFAULTS.vehicle_color;
	}

	static getConfigElement() {
		return document.createElement("car-leasing-card-editor");
	}

	static getStubConfig() {
		return {
			mileage_entity: "",
			contract_start: "",
			contract_end: "",
		};
	}

	setConfig(config) {
		// Keep incomplete configurations renderable while the visual editor is
		// setting up a new card. _render() uses temporary preview data until the
		// required mileage sensor and contract dates are provided.
		this._config = {
			...config
		};
		this._lastRenderKey = null;
		if (this._hass && this.shadowRoot) {
			this._lastRenderKey = this._renderKey();
			this._render();
		}
	}

	set hass(hass) {
		this._hass = hass;
		if (!this.shadowRoot) {
			this.attachShadow({
				mode: "open"
			});
		}
		// Home Assistant sets hass on every state change in the instance.
		// Re-render only when something this card displays has changed.
		const key = this._renderKey();
		if (key === this._lastRenderKey)
			return;
		this._lastRenderKey = key;
		this._render();
	}

	_renderKey() {
		const h = this._hass;
		const state = h?.states?.[this._config?.mileage_entity];
		return [
			state?.state,
			state?.last_updated,
			Boolean(h?.themes?.darkMode),
			h?.locale?.language || h?.language,
			h?.locale?.number_format,
			new Date().toDateString(),
		].join("|");
	}

	getCardSize() {
		return 5;
	}

	_t(lang, key) {
		return (CarLeasingCard.TRANSLATIONS[lang] && CarLeasingCard.TRANSLATIONS[lang][key]) ||
			CarLeasingCard.TRANSLATIONS.en[key] || key;
	}

	_tYearMarker(lang, n) {
		return this._t(lang, "year_marker").replace("{n}", n);
	}

	_show(name) {
		const cfg = this._config || {};
		return cfg[`show_${name}`] !== false && cfg[`hide_${name}`] !== true;
	}

	_clamp(v, min, max) {
		return Number.isNaN(v) ? min : Math.min(max, Math.max(min, v));
	}

	_daysBetween(a, b) {
		return (b.getTime() - a.getTime()) / 86400000;
	}

	_groupDigits(digitsStr, groupSeparator) {
		return digitsStr.replace(/\B(?=(\d{3})+(?!\d))/g, groupSeparator);
	}

	_fmtNum(n, lang, numberFormat) {
		if (!isFinite(n))
			return "–";
		const rounded = Math.round(n);

		// "None": raw number, no thousands separator.
		if (numberFormat === "none")
			return String(rounded);

		// "System": defer entirely to the browser/OS locale.
		if (numberFormat === "system") {
			return new Intl.NumberFormat(undefined, {
				maximumFractionDigits: 0
			}).format(rounded);
		}

		// comma_decimal / decimal_comma / space_comma: build the string from the
		// separators the option name itself describes.
		const separators = CarLeasingCard.NUMBER_SEPARATORS[numberFormat];
		if (separators) {
			const isNegative = rounded < 0;
			const grouped = this._groupDigits(String(Math.abs(rounded)), separators.group);
			return `${isNegative ? "-" : ""}${grouped}`;
		}

		// Default (unset, or "language"): follow the interface's own language, untouched.
		return new Intl.NumberFormat(lang, {
			maximumFractionDigits: 0
		}).format(rounded);
	}

	_escapeHtml(value) {
		return String(value)
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#039;");
	}

	_fmtCurrency(n, currency, lang, numberFormat) {
		if (!isFinite(n))
			return "–";
		if (numberFormat === "none")
			return `${n.toFixed(2)} ${currency}`;
		if (numberFormat === "system") {
			return (
				new Intl.NumberFormat(undefined, {
					minimumFractionDigits: 2,
					maximumFractionDigits: 2,
				}).format(n) +
				" " +
				currency);
		}
		const separators = CarLeasingCard.NUMBER_SEPARATORS[numberFormat];
		if (separators) {
			const isNegative = n < 0;
			const [intPart, decPart] = Math.abs(n).toFixed(2).split(".");
			const grouped = this._groupDigits(intPart, separators.group);
			return `${isNegative ? "-" : ""}${grouped}${separators.decimal}${decPart} ${currency}`;
		}
		return (
			new Intl.NumberFormat(lang, {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2,
			}).format(n) +
			" " +
			currency);
	}

	_fmtDate(dateStr, lang) {
		try {
			return new Intl.DateTimeFormat(lang, {
				year: "numeric",
				month: "short",
				day: "numeric"
			}).format(
				new Date(dateStr));
		} catch (e) {
			return this._escapeHtml(dateStr);
		}
	}

	static _vehicleSvgCache = new Map();
	static _vehicleSvgRequests = new Map();

	_carSvgForType(vehicleType) {
		const type = CarLeasingCard._resolveVehicleType(vehicleType);
		const cached = CarLeasingCard._vehicleSvgCache.get(type);
		if (cached !== undefined) return cached;

		this._loadVehicleSvg(type);
		return "";
	}

	_loadVehicleSvg(type) {
		// `type` is resolved through VEHICLE_TYPES before it reaches this method.
		// This whitelist prevents arbitrary paths or URLs from being requested.
		if (!CarLeasingCard.VEHICLE_TYPES.some((item) => item.value === type)) return;

		if (CarLeasingCard._vehicleSvgCache.has(type)) return;
		if (CarLeasingCard._vehicleSvgRequests.has(type)) return;

		const request = (async () => {
			try {
				const url = new URL(`./vehicles/${type}.svg`, import.meta.url);
				const response = await fetch(url, { credentials: "same-origin" });
				if (!response.ok) throw new Error(`HTTP ${response.status}`);

				const svg = (await response.text()).trim();
				// Only bundled SVG files are accepted. Reject unexpected responses such as
				// HTML error/login pages before they are inserted into the shadow DOM.
				if (!svg.startsWith("<svg") || !svg.endsWith("</svg>"))
					throw new Error("Invalid SVG response");

				CarLeasingCard._vehicleSvgCache.set(type, svg);
				if (this.isConnected && this._config) this._render();
			} catch (error) {
				console.warn(`[car-leasing-card] Unable to load vehicle SVG: ${type}`, error);
			} finally {
				CarLeasingCard._vehicleSvgRequests.delete(type);
			}
		})();

		CarLeasingCard._vehicleSvgRequests.set(type, request);
	}

	_lang() {
		const configLanguage = this._config.language;
		if (configLanguage && configLanguage !== "auto") {
			const code = String(configLanguage);
			return Object.prototype.hasOwnProperty.call(CarLeasingCard.TRANSLATIONS, code) ? code : "en";
		}
		const hassLang = (
			(this._hass && (this._hass.locale?.language || this._hass.language)) || "en").split("-")[0];
		return CarLeasingCard.TRANSLATIONS[hassLang] ? hassLang : "en";
	}

	_computeData() {
		const cfg = this._config;
		const hass = this._hass;
		const stateObj = hass.states[cfg.mileage_entity];
		if (!stateObj) {
			return {
				error: "not_available"
			};
		}
		const currentMileage = parseFloat(stateObj.state);
		if (isNaN(currentMileage)) {
			return {
				error: "not_available"
			};
		}

		const startDate = new Date(cfg.contract_start);
		const endDate = new Date(cfg.contract_end);
		if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || endDate <= startDate) {
			return {
				error: "check_config"
			};
		}

		const annualAllowance = Number(cfg.annual_allowance ?? CarLeasingCard.FIELD_DEFAULTS.annual_allowance);
		const extraKmCost = Number(cfg.extra_km_cost ?? CarLeasingCard.FIELD_DEFAULTS.extra_km_cost);
		const startMileage = Number(cfg.start_mileage ?? CarLeasingCard.FIELD_DEFAULTS.start_mileage) || 0;
		const aheadTolerancePct = Number(
			cfg.ahead_tolerance_pct ?? CarLeasingCard.FIELD_DEFAULTS.ahead_tolerance_pct);

		const now = new Date();
		const totalDays = this._daysBetween(startDate, endDate);
		const totalYears = totalDays / 365.25;
		const totalAllowedKm = annualAllowance * totalYears;
		const drivenKm = Math.max(0, currentMileage - startMileage);

		const elapsedDays = this._clamp(this._daysBetween(startDate, now), 0, totalDays);
		const expectedKmToDate = annualAllowance * (elapsedDays / 365.25);

		const progressPct = totalAllowedKm > 0 ? this._clamp((drivenKm / totalAllowedKm) * 100, 0, 100) : 0;
		const expectedPct = totalAllowedKm > 0 ? this._clamp((expectedKmToDate / totalAllowedKm) * 100, 0, 100) : 0;

		const remainingKm = totalAllowedKm - drivenKm;
		const extraKm = drivenKm > totalAllowedKm ? drivenKm - totalAllowedKm : 0;
		const extraCost = extraKm * extraKmCost;

		const daysLeftRaw = Math.ceil(this._daysBetween(now, endDate));
		const contractEnded = daysLeftRaw <= 0;
		const daysLeft = Math.max(0, daysLeftRaw);

		const YEAR_EPS = 0.01;
		const yearMarkers = [];
		if (totalYears > 1 + YEAR_EPS && totalYears <= 10) {
			const wholeYears = Math.floor(totalYears + YEAR_EPS);
			for (let k = 1; k <= wholeYears; k++) {
				if (k >= totalYears - YEAR_EPS)
					break;
				yearMarkers.push({
					year: k,
					pct: (k / totalYears) * 100
				});
			}
		}

		let status = "on_track";
		if (drivenKm > totalAllowedKm) {
			status = "over";
		} else if (elapsedDays > 0 && drivenKm > expectedKmToDate * (1 + aheadTolerancePct / 100)) {
			status = "ahead";
		}

		return {
			currentMileage,
			drivenKm,
			totalAllowedKm,
			expectedKmToDate,
			progressPct,
			expectedPct,
			yearMarkers,
			remainingKm,
			extraKm,
			extraCost,
			daysLeft,
			contractEnded,
			status,
			endDate: cfg.contract_end,
		};
	}

	_render() {
		if (!this._config || !this._hass)
			return;
		const lang = this._lang();
		const numberFormat = this._hass?.locale?.number_format;
		const cfg = this._config;
		let data = this._computeData();
		const darkMode = Boolean(this._hass?.themes?.darkMode);

		// While no mileage sensor is selected, show temporary values so a new card has
		// a preview. They are never saved. As soon as a sensor is selected, no
		// temporary value is displayed anymore.
		if (data.error && !cfg.mileage_entity) {
			const previewEnd = new Date();
			previewEnd.setFullYear(previewEnd.getFullYear() + 2);
			const previewAnnualAllowance = Number(
				cfg.annual_allowance ?? CarLeasingCard.FIELD_DEFAULTS.annual_allowance);
			const previewTotalAllowedKm = previewAnnualAllowance * 3;
			const previewCurrentMileage = Number(
				cfg.start_mileage ?? CarLeasingCard.FIELD_DEFAULTS.start_mileage) + previewAnnualAllowance;
			data = {
				currentMileage: previewCurrentMileage,
				drivenKm: previewAnnualAllowance,
				totalAllowedKm: previewTotalAllowedKm,
				expectedKmToDate: previewAnnualAllowance,
				progressPct: 100 / 3,
				expectedPct: 100 / 3,
				yearMarkers: [{ year: 1, pct: 100 / 3 }, { year: 2, pct: 200 / 3 }],
				remainingKm: previewTotalAllowedKm - previewAnnualAllowance,
				extraKm: 0,
				extraCost: 0,
				daysLeft: 730,
				contractEnded: false,
				status: "on_track",
				endDate: previewEnd.toISOString().slice(0, 10),
			};
		}

		if (data.error === "check_config") {
			const hintTitle = this._escapeHtml(cfg.name || this._t(lang, "title"));
			const hintCarHidden = !this._show("car_image");
			const hintVehicle = hintCarHidden
				? ""
				: `<div class="car-wrap${cfg.flip_vehicle === true ? " flip" : ""}" style="--vehicle-color:${CarLeasingCard._safeColor(cfg.vehicle_color)}">${this._carSvgForType(cfg.vehicle_type || CarLeasingCard.FIELD_DEFAULTS.vehicle_type)}</div>`;
			const hintHeaderParts = [];
			if (this._show("title_icon"))
				hintHeaderParts.push(`<div class="h-icon"><ha-icon icon="mdi:car"></ha-icon></div>`);
			if (this._show("title"))
				hintHeaderParts.push(`<div class="title">${hintTitle}</div>`);
			const hintHeader = hintHeaderParts.length
				? `<div class="header${hintCarHidden ? " no-car" : ""}">${hintHeaderParts.join("")}</div>`
				: "";
			this.shadowRoot.innerHTML = `
		  <style>${this._baseStyles()}</style>
		  <ha-card>
			<div class="card-content${darkMode ? " dark-mode" : ""}">
			  ${hintHeader}
			  ${hintVehicle}
			  <div class="error-state hint-state">
				<ha-icon icon="mdi:information-outline"></ha-icon>
				<div class="error-sub">${this._t(lang, "check_config")}</div>
			  </div>
			</div>
		  </ha-card>`;
			return;
		}

		if (data.error) {
			this.shadowRoot.innerHTML = `
		  <style>${this._baseStyles()}</style>
		  <ha-card>
			<div class="card-content error-state">
			  <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
			  <div>
				<div class="error-title">${this._t(lang, "not_available")}</div>
				<div class="error-sub">${this._t(lang, "check_config")}</div>
			  </div>
			</div>
		  </ha-card>`;
			return;
		}

		const title = this._escapeHtml(cfg.name || this._t(lang, "title"));
		const statusColors = CarLeasingCard.STATUS_COLORS[data.status];
		const markerColor = CarLeasingCard.STATUS_MARKER_COLORS[data.status];
		const statusLabel = this._t(lang, `status_${data.status}`);
		const currency = this._escapeHtml(cfg.currency || CarLeasingCard.FIELD_DEFAULTS.currency);

		const yearTicks = data.yearMarkers
			.map(
				(m) =>
`<div class="year-tick" style="left:${m.pct}%" title="${this._tYearMarker(lang, m.year)}"></div>`)
			.join("");

		const carHidden = !this._show("car_image");
		const vehicleType = cfg.vehicle_type || CarLeasingCard.FIELD_DEFAULTS.vehicle_type;
		const carWrapBlock = carHidden
			 ? ""
			 : `<div class="car-wrap${cfg.flip_vehicle === true ? " flip" : ""}" style="--vehicle-color:${CarLeasingCard._safeColor(cfg.vehicle_color)}">${this._carSvgForType(vehicleType)}</div>`;

		const gapKm = data.drivenKm - data.expectedKmToDate;
		const gapSign = gapKm >= 0 ? "+" : "";
		const gapLabel = `${gapSign}${this._fmtNum(gapKm, lang, numberFormat)} km`;

		const badgeHidden = !this._show("progress_badge");
		const badgeBlock = badgeHidden
			 ? ""
			 : `<div class="progress-marker-badge" style="background:${markerColor}">${gapLabel}</div>`;

		const progressMarkerBlock = `
				<div class="progress-marker-wrap" style="left:${data.expectedPct}%" title="${this._t(lang, "expected_today")}">
				  <div class="progress-marker-arrow" style="border-top-color:${markerColor}"></div>
				  ${badgeBlock}
				</div>`;

		const progressBlock = `
			<div class="progress-section${badgeHidden ? " no-badge" : ""}">
			  <div class="progress-track">
				<div class="progress-fill" style="width:${data.progressPct}%;background:${statusColors.color}"></div>
				${yearTicks}
				${progressMarkerBlock}
			  </div>
			  <div class="progress-labels">
				<span>0 km</span>
				<span>${this._fmtNum(data.totalAllowedKm, lang, numberFormat)} km</span>
			  </div>
			</div>`;

		const statRows = [];
		if (this._show("current_mileage")) {
			statRows.push(`
			  <div class="stat">
				<span class="stat-label">${this._t(lang, "current_mileage")}</span>
				<span class="stat-value">${this._fmtNum(data.currentMileage, lang, numberFormat)} km</span>
			  </div>`);
		}
		if (this._show("driven")) {
			statRows.push(`
			  <div class="stat">
				<span class="stat-label">${this._t(lang, "driven")}</span>
				<span class="stat-value">${this._fmtNum(data.drivenKm, lang, numberFormat)} km</span>
			  </div>`);
		}
		if (this._show("expected_today")) {
			statRows.push(`
			  <div class="stat">
				<span class="stat-label">${this._t(lang, "expected_today")}</span>
				<span class="stat-value">${this._fmtNum(data.expectedKmToDate, lang, numberFormat)} km</span>
			  </div>`);
		}
		if (this._show("remaining")) {
			statRows.push(`
			  <div class="stat">
				<span class="stat-label">${this._t(lang, "remaining")}</span>
				<span class="stat-value ${data.remainingKm < 0 ? "negative" : ""}">${this._fmtNum(
					data.remainingKm,
					lang,
					numberFormat)} km</span>
			  </div>`);
		}
		if (this._show("days_left")) {
			statRows.push(`
			  <div class="stat">
				<span class="stat-label">${this._t(lang, "days_left")}</span>
				<span class="stat-value">${data.contractEnded ? this._t(lang, "contract_ended") : data.daysLeft}</span>
			  </div>`);
		}
		if (this._show("contract_ends")) {
			statRows.push(`
			  <div class="stat">
				<span class="stat-label">${this._t(lang, "contract_ends")}</span>
				<span class="stat-value">${this._fmtDate(data.endDate, lang)}</span>
			  </div>`);
		}

		const statsPanelBlock =
			statRows.length > 0
			 ? `
			<div class="stats-panel">
			  <div class="stats-grid">${statRows.join("")}
			  </div>
			</div>`
			 : "";

		const extraBlock =
			data.extraKm > 0 && this._show("extra_alert")
			 ? `
		<div class="extra-banner">
		  <ha-icon icon="mdi:cash-alert"></ha-icon>
		  <div class="extra-text">
			<div class="extra-line"><span>${this._t(lang, "extra_km")}</span><b>${this._fmtNum(data.extraKm, lang, numberFormat)} km</b></div>
			<div class="extra-line"><span>${this._t(lang, "extra_cost")}</span><b>${this._fmtCurrency(
				data.extraCost,
				currency,
				lang,
				numberFormat)}</b></div>
		  </div>
		</div>`
			 : "";

		const headerParts = [];
		if (this._show("title_icon")) {
			headerParts.push(`<div class="h-icon"><ha-icon icon="mdi:car"></ha-icon></div>`);
		}
		if (this._show("title")) {
			headerParts.push(`<div class="title">${title}</div>`);
		}
		if (this._show("status_chip")) {
			headerParts.push(`
			  <div class="status-chip" style="color:${statusColors.color};background:${statusColors.bg}">
				${statusLabel}
			  </div>`);
		}
		const headerBlock =
			headerParts.length > 0
			 ? `
			<div class="header${carHidden ? " no-car" : ""}">${headerParts.join("")}
			</div>`
			 : "";

		this.shadowRoot.innerHTML = `
		<style>${this._baseStyles()}</style>
		<ha-card>
		  <div class="card-content${darkMode ? " dark-mode" : ""}">
			${headerBlock}
			${carWrapBlock}
			${progressBlock}
			${statsPanelBlock}
			${extraBlock}
		  </div>
		</ha-card>`;
	}

	_baseStyles() {
		return `
		ha-card { padding: 0; overflow: hidden; }
		.card-content { padding: 16px; }

		.error-state { display:flex; align-items:center; gap:12px; color: var(--secondary-text-color); }
		.error-state ha-icon { color: var(--error-color, #f44336); --mdc-icon-size: 28px; }
		.error-title { font-weight: 600; color: var(--primary-text-color); }
		.error-sub { font-size: 0.85em; }
		.hint-state { margin-top: 8px; }
		.hint-state ha-icon { color: var(--secondary-text-color); }

		.header { display:flex; align-items:center; gap:10px; margin-bottom: 4px; }
		.header.no-car { margin-bottom: 20px; }
		.h-icon {
		  display: flex; align-items: center; justify-content: center;
		  width: 44px; height: 44px; flex-shrink: 0;
		  border: 1px solid var(--divider-color);
		  border-radius: 14px;
		  background: #f4f6f8;
		  box-shadow: 0 2px 6px rgba(0,0,0,.15);
		}
		.h-icon ha-icon { --mdc-icon-size: 24px; color: #0288d1; }
		.card-content.dark-mode .h-icon {
		  background: var(--secondary-background-color);
		  box-shadow: 0 2px 8px rgba(0,0,0,.5), 0 0 0 1px rgba(255,255,255,.06);
		}

		.title { flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size: 1.2em; font-weight: 600; color: var(--primary-text-color); }
		.status-chip { margin-left: auto; font-size: 0.75em; font-weight: 600; padding: 4px 10px; border-radius: 12px; white-space: nowrap; flex-shrink: 0; }

		.car-wrap { width: 100%; display:flex; justify-content:center; margin: 4px 0 8px; }
		.car-svg { width: 100%; max-width: 260px; height: auto; }
		.car-wrap.flip .car-svg { transform: scaleX(-1); }

		.progress-section { margin: 34px 0 16px; }
		.progress-section.no-badge { margin-top: 12px; }
		.progress-track { position: relative; height: 14px; border-radius: 7px; background: var(--divider-color); overflow: visible; }
		.progress-fill { position: absolute; left:0; top:0; height:100%; border-radius:7px; transition: width .4s ease; }
		.year-tick { position: absolute; top:0; height:100%; width:1px; background: var(--primary-text-color); opacity: 0.25; }
		.progress-marker-wrap {
		  position: absolute; top: -32px; height: 28px;
		  pointer-events: none;
		  filter: drop-shadow(0 1px 2px rgba(0,0,0,.35));
		}
		.progress-marker-arrow {
		  position: absolute; left: 0; bottom: 0; transform: translateX(-50%);
		  width: 0; height: 0;
		  border-left: 5px solid transparent;
		  border-right: 5px solid transparent;
		  border-top: 6px solid;
		}
		.progress-marker-badge {
		  position: absolute; left: 0; bottom: 5px; transform: translateX(-50%);
		  font-size: 0.68em; font-weight: 700; color: #fff;
		  padding: 2px 6px; border-radius: 6px; white-space: nowrap;
		}
		.progress-labels { display:flex; justify-content:space-between; font-size:0.75em; color: var(--secondary-text-color); margin-top:4px; }

		.stats-panel {
		  margin-top: 4px;
		  padding: 12px 16px;
		  border: 1px solid var(--divider-color);
		  border-radius: 12px;
		  background: #f6f8fa;
		}
		.card-content.dark-mode .stats-panel {
		  background: var(--secondary-background-color);
		}
		.stats-grid { display:grid; grid-template-columns: 1fr 1fr; gap: 10px 16px; }
		.stat { display:flex; flex-direction:column; gap:2px; }
		.stat-label { font-size: 0.75em; color: var(--secondary-text-color); }
		.stat-value { font-size: 1em; font-weight: 600; color: var(--primary-text-color); }
		.stat-value.negative { color: var(--error-color, #f44336); }

		.extra-banner { display:flex; align-items:center; gap:12px; margin-top:16px; padding: 10px 12px; border-radius: 8px; background: rgba(244,67,54,0.12); }
		.extra-banner ha-icon { color: var(--error-color, #f44336); --mdc-icon-size: 26px; flex-shrink:0; }
		.extra-text { display:flex; flex-direction:column; gap:2px; }
		.extra-line { display:flex; justify-content:space-between; gap:16px; font-size:0.9em; color: var(--primary-text-color); }
	  `;
	}
}

/* ---------------------------------------------------------------------- */
/*  Visual editor                                                         */
/* ---------------------------------------------------------------------- */
class CarLeasingCardEditor extends HTMLElement {
	static EDITOR_LABELS = {
		name: "Card name",
		mileage_entity: "Mileage sensor",
		start_mileage: "Mileage at contract start",
		contract_start: "Contract start date",
		contract_end: "Contract end date",
		annual_allowance: "Allowed km / year",
		ahead_tolerance_pct: "Ahead-of-pace tolerance (%)",
		extra_km_cost: "Cost per extra km",
		currency: "Currency symbol",
		vehicle_type: "Vehicle type",
		language: "Card display language",
	};

	static SECTION_ICONS = {
		general: "mdi:cog-outline",
		contract: "mdi:file-document-edit-outline",
		appearance: "mdi:palette-outline",
	};

	static REQUIRED_FIELDS = new Set(["mileage_entity", "contract_start", "contract_end"]);

	static DECIMAL_TEXT_FIELDS = new Set([
		"annual_allowance",
		"ahead_tolerance_pct",
		"start_mileage",
		"extra_km_cost",
	]);

	// Plain on/off options: stored only when enabled.
	static FLAG_FIELDS = new Set(["flip_vehicle"]);

	static VISIBILITY_FIELDS = new Set(
		CarLeasingCard.VISIBILITY_KEYS.map((name) => `show_${name}`));

	static LANGUAGE_OPTIONS = CarLeasingCardEditor._buildLanguageOptions();

	static _languageDisplayName(code) {
		try {
			const displayNames = new Intl.DisplayNames([code], {
				type: "language"
			});
			const name = displayNames.of(code);
			return name ? name.charAt(0).toUpperCase() + name.slice(1) : code;
		} catch (error) {
			return code;
		}
	}

	static _buildLanguageOptions() {
		const options = [{
				value: "auto",
				label: "Auto"
			}
		];
		for (const code of Object.keys(CarLeasingCard.TRANSLATIONS)) {
			options.push({
				value: code,
				label: CarLeasingCardEditor._languageDisplayName(code)
			});
		}
		return options;
	}

	static _getDeepActiveElement() {
		let active = document.activeElement;
		while (active && active.shadowRoot && active.shadowRoot.activeElement) {
			active = active.shadowRoot.activeElement;
		}
		return active;
	}

	constructor() {
		super();
		this._rendered = false;
	}

	setConfig(config) {
		this._config = {
			...config
		};
		if (!this._rendered) {
			this._render();
			this._rendered = true;
		}
		this._updateValues();
	}

	set hass(hass) {
		this._hass = hass;
		// Home Assistant can set hass before setConfig. The first render decides
		// whether Contract starts open, so it must wait for the configuration.
		if (!this._rendered && this._config) {
			this._render();
			this._rendered = true;
		}
		this._updateValues();
	}

	connectedCallback() {
		if (!this._rendered && this._config) {
			this._render();
			this._rendered = true;
			this._updateValues();
		}
	}

	_languageOptions() {
		return CarLeasingCardEditor.LANGUAGE_OPTIONS;
	}

	_sectionSummary(icon, title) {
		return `<summary><span class="section-title"><ha-icon icon="${icon}"></ha-icon>${title}</span></summary>`;
	}

	_entityPicker(key, label, domains = []) {
		return `<div class="field"><span>${label}</span><ha-entity-picker data-config="${key}" data-domains="${domains.join(
			",")}" allow-custom-entity></ha-entity-picker></div>`;
	}

	_switchRow(key, label, description = "") {
		return `
		<div class="switch-row">
		  <div class="switch-text">
			<span class="switch-label">${label}</span>
			${description ? `<span class="field-description">${description}</span>` : ""}
		  </div>
		  <ha-switch data-config="${key}"></ha-switch>
		</div>`;
	}

	_colorRow(key, label) {
		return `
		<div class="switch-row">
		  <div class="switch-text">
			<span class="switch-label">${label}</span>
		  </div>
		  <input type="color" class="color-input" data-config="${key}" value="${CarLeasingCard.FIELD_DEFAULTS[key] || "#ffffff"}" aria-label="${label}">
		</div>`;
	}

	_switchGroup(title, rows, columns = 1) {
		return `
		<div class="switch-group">
		  <div class="group-title">${title}</div>
		  <div class="switch-grid${columns === 2 ? " two-cols" : ""}">${rows.join("")}
		  </div>
		</div>`;
	}

	_render() {
		this.innerHTML = `
		<style>
		  .editor { display: grid; gap: 12px; padding: 8px 0; }
		  details.section {
			overflow: hidden;
			background: var(--ha-card-background, var(--card-background-color));
			border: 1px solid var(--divider-color);
			border-radius: var(--ha-card-border-radius,12px);
		  }
		  summary {
			display: flex; align-items: center; justify-content: space-between; gap: 12px;
			padding: 16px; color: var(--primary-text-color);
			font-size: 16px; font-weight: 600; cursor: pointer;
			list-style: none; user-select: none;
		  }
		  summary::-webkit-details-marker { display: none; }
		  .section-title { display: flex; align-items: center; gap: 10px; min-width: 0; }
		  .section-title ha-icon { --mdc-icon-size: 20px; color: var(--secondary-text-color); flex-shrink: 0; }
		  summary::after {
			content: ""; width: 8px; height: 8px; flex-shrink: 0;
			border-right: 2px solid var(--secondary-text-color);
			border-bottom: 2px solid var(--secondary-text-color);
			transform: rotate(45deg); transition: transform .2s ease;
		  }
		  details[open] summary::after { transform: rotate(225deg); }
		  details[open] summary { border-bottom: 1px solid var(--divider-color); }
		  .section-content { display: grid; gap: 14px; padding: 16px; }
		  .grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 12px; }
		  .entity-grid { display: grid; grid-template-columns: 1fr; gap: 14px; }
		  label, .field { display: grid; gap: 6px; color: var(--secondary-text-color); font-size: 12px; }
		  input {
			box-sizing: border-box; width: 100%; min-height: 42px; padding: 8px 10px;
			color: var(--primary-text-color);
			background: var(--ha-card-background, var(--card-background-color));
			border: 1px solid var(--divider-color); border-radius: 8px; font: inherit;
		  }
		  ha-entity-picker, ha-selector { display: block; width: 100%; }
		  .switch-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; min-height: 42px; }
		  .switch-text { display: grid; gap: 3px; min-width: 0; }
		  .switch-label { color: var(--primary-text-color); font-size: 14px; }
		  .field-description { color: var(--secondary-text-color); font-size: 12px; line-height: 1.4; }
		  ha-switch { flex-shrink: 0; }
		  input.color-input { width: 44px; min-height: 32px; height: 32px; padding: 2px; cursor: pointer; flex-shrink: 0; }
		  .appearance-hint { color: var(--secondary-text-color); font-size: 12px; }
		  .switch-group { display: grid; gap: 4px; }
		  .switch-group + .switch-group { padding-top: 12px; border-top: 1px solid var(--divider-color); }
		  .group-title { color: var(--secondary-text-color); font-size: 12px; font-weight: 600; letter-spacing: .04em; text-transform: uppercase; }
		  .switch-grid { display: grid; grid-template-columns: 1fr; column-gap: 24px; }
		  .switch-grid.two-cols { grid-template-columns: repeat(2,minmax(0,1fr)); }
		  .switch-grid .switch-row { min-height: 40px; gap: 12px; }
		  .switch-grid .switch-label { overflow-wrap: anywhere; }
		  @media (max-width:600px) { .grid, .switch-grid.two-cols { grid-template-columns: 1fr; } }
		</style>
		<div class="editor">
		  <details class="section">
			${this._sectionSummary(CarLeasingCardEditor.SECTION_ICONS.general, "General")}
			<div class="section-content"><div class="entity-grid">
			  <label>${CarLeasingCardEditor.EDITOR_LABELS.name}<input data-config="name" type="text" placeholder="${CarLeasingCard.TRANSLATIONS.en.title}"></label>
			  <div class="field"><span>${CarLeasingCardEditor.EDITOR_LABELS.vehicle_type}</span><ha-selector data-config="vehicle_type"></ha-selector></div>
			  <div class="field"><span>${CarLeasingCardEditor.EDITOR_LABELS.language}</span><ha-selector data-config="language"></ha-selector></div>
			</div></div>
		  </details>
		  <details class="section"${this._config?.mileage_entity ? "" : " open"}>
			${this._sectionSummary(CarLeasingCardEditor.SECTION_ICONS.contract, "Contract")}
			<div class="section-content"><div class="entity-grid">
			  <div class="field"><span>${CarLeasingCardEditor.EDITOR_LABELS.mileage_entity}</span><ha-selector data-config="mileage_entity"></ha-selector></div>
			  <div class="grid">
				<div class="field"><span>${CarLeasingCardEditor.EDITOR_LABELS.contract_start}</span><ha-selector data-config="contract_start"></ha-selector></div>
				<div class="field"><span>${CarLeasingCardEditor.EDITOR_LABELS.contract_end}</span><ha-selector data-config="contract_end"></ha-selector></div>
				<label>${CarLeasingCardEditor.EDITOR_LABELS.annual_allowance}<input data-config="annual_allowance" type="text" inputmode="decimal" placeholder="${CarLeasingCard.FIELD_DEFAULTS.annual_allowance}"></label>
				<label>${CarLeasingCardEditor.EDITOR_LABELS.start_mileage}<input data-config="start_mileage" type="text" inputmode="decimal" placeholder="${CarLeasingCard.FIELD_DEFAULTS.start_mileage}"></label>
				<label>${CarLeasingCardEditor.EDITOR_LABELS.extra_km_cost}<input data-config="extra_km_cost" type="text" inputmode="decimal" placeholder="${CarLeasingCard.FIELD_DEFAULTS.extra_km_cost}"></label>
				<label>${CarLeasingCardEditor.EDITOR_LABELS.currency}<input data-config="currency" type="text" placeholder="${CarLeasingCard.FIELD_DEFAULTS.currency}"></label>
				<label>${CarLeasingCardEditor.EDITOR_LABELS.ahead_tolerance_pct}<input data-config="ahead_tolerance_pct" type="text" inputmode="decimal" placeholder="${CarLeasingCard.FIELD_DEFAULTS.ahead_tolerance_pct}"></label>
			  </div>
			</div></div>
		  </details>
		  <details class="section">
			${this._sectionSummary(CarLeasingCardEditor.SECTION_ICONS.appearance, "Appearance")}
			<div class="section-content">
			  <div class="appearance-hint">Turn a switch off to hide it.</div>
			  ${this._switchGroup("Header", [
				this._switchRow("show_title_icon", "Title icon"),
				this._switchRow("show_title", "Card title"),
				this._switchRow("show_status_chip", "Status chip"),
			  ])}
			  ${this._switchGroup("Illustration", [
				this._switchRow("show_car_image", "Car illustration"),
				this._switchRow("flip_vehicle", "Flip horizontally", "Puts the front of the vehicle on the left."),
				this._colorRow("vehicle_color", "Vehicle color"),
			  ])}
			  ${this._switchGroup("Progress bar", [
				this._switchRow(
				  "show_progress_badge",
				  "Progress badge",
				  "Shows the km-gap badge. The pointer arrow always stays visible."),
			  ])}
			  ${this._switchGroup("Info panel", [
				this._switchRow("show_current_mileage", "Current mileage"),
				this._switchRow("show_driven", "Driven since start"),
				this._switchRow("show_expected_today", "Expected by today"),
				this._switchRow("show_remaining", "Remaining"),
				this._switchRow("show_days_left", "Days left"),
				this._switchRow("show_contract_ends", "Contract end date"),
			  ], 2)}
			  ${this._switchGroup("Alerts", [
				this._switchRow(
				  "show_extra_alert",
				  "Extra-cost alert",
				  "Shows the extra-km cost banner when the allowance is exceeded."),
			  ])}
			</div>
		  </details>
		</div>
	  `;
		this._initializeEntityPickers();
		this._initializeSelectFields();
		this._initializeStandardFields();
		this._initializeSwitchFields();
	}

	_initializeEntityPickers() {
		this.querySelectorAll("ha-entity-picker[data-config]").forEach((picker) => {
			picker.hass = this._hass;
			picker.allowCustomEntity = true;
			const domains = picker.dataset.domains?.split(",").filter(Boolean);
			if (domains?.length)
				picker.includeDomains = domains;
			picker.addEventListener("value-changed", (event) => this._valueChanged(event));
		});
	}

	_initializeSelectFields() {
		this.querySelectorAll("ha-selector[data-config]").forEach((selector) => {
			const key = selector.dataset.config;
			selector.hass = this._hass;
			if (key === "language") {
				selector.selector = {
					select: {
						mode: "dropdown",
						options: this._languageOptions()
					}
				};
			} else if (key === "mileage_entity") {
				selector.selector = {
					entity: {
						filter: {
							domain: "sensor",
							device_class: "distance"
						}
					}
				};
			} else if (key === "vehicle_type") {
				selector.selector = {
					select: {
						mode: "dropdown",
						options: CarLeasingCard.VEHICLE_TYPE_OPTIONS
					}
				};
			} else {
				selector.selector = {
					date: {}
				};
			}
			selector.addEventListener("value-changed", (event) => this._valueChanged(event));
		});
	}

	_initializeStandardFields() {
		this.querySelectorAll("input[data-config]").forEach((element) => {
			element.addEventListener("input", (event) => this._valueChanged(event));
		});
	}

	_initializeSwitchFields() {
		this.querySelectorAll("ha-switch[data-config]").forEach((element) => {
			element.addEventListener("change", (event) => this._valueChanged(event));
		});
	}

	_updateValues() {
		if (!this._rendered || !this._config)
			return;
		this.querySelectorAll("[data-config]").forEach((element) => {
			const key = element.dataset.config;
			const value = this._config[key];
			if (element.tagName === "HA-ENTITY-PICKER") {
				element.hass = this._hass;
				element.value = value ?? "";
				return;
			}
			if (element.tagName === "HA-SELECTOR") {
				element.hass = this._hass;
				const isEmpty = value === undefined || value === null || value === "";
				if (key === "language") {
					element.value = isEmpty ? CarLeasingCard.FIELD_DEFAULTS.language : value;
					return;
				}
				if (key === "vehicle_type") {
					element.value = isEmpty
						? CarLeasingCard.FIELD_DEFAULTS.vehicle_type
						: CarLeasingCard._resolveVehicleType(value);
					return;
				}
				element.value = value ?? "";
				return;
			}
			if (element.tagName === "HA-SWITCH") {
				element.checked = CarLeasingCardEditor.VISIBILITY_FIELDS.has(key)
					? this._isVisible(key)
					: value === true;
				return;
			}
			if (key === "vehicle_color") {
				element.value = CarLeasingCard._safeColor(value);
				return;
			}
			if (CarLeasingCardEditor._getDeepActiveElement() !== element) {
				element.value = value ?? "";
			}
		});
	}

	_isVisible(key) {
		const name = key.slice("show_".length);
		return this._config[key] !== false && this._config[`hide_${name}`] !== true;
	}

	_valueChanged(event) {
		if (!this._config)
			return;
		const target = event.currentTarget;
		const key = target?.dataset?.config;
		if (!key)
			return;
		let value;
		if (target.tagName === "HA-ENTITY-PICKER" || target.tagName === "HA-SELECTOR") {
			value = event.detail?.value ?? target.value ?? "";
			if (key === "language" && value === CarLeasingCard.FIELD_DEFAULTS.language)
				value = "";
			if (key === "vehicle_type" && value === CarLeasingCard.FIELD_DEFAULTS.vehicle_type)
				value = "";
		} else if (target.tagName === "HA-SWITCH") {
			value = Boolean(target.checked);
		} else if (CarLeasingCardEditor.DECIMAL_TEXT_FIELDS.has(key)) {
			const raw = target.value.trim();
			if (raw === "") {
				value = undefined;
			} else {
				const normalized = raw.replace(",", ".");
				const parsed = Number(normalized);
				if (!Number.isFinite(parsed)) {
					return;
				}
				value = parsed;
			}
		} else {
			value = target.value;
			// Default colour is stored as "no value".
			if (key === "vehicle_color" && CarLeasingCard._safeColor(value) === CarLeasingCard.FIELD_DEFAULTS.vehicle_color)
				value = "";
		}
		if (CarLeasingCardEditor.REQUIRED_FIELDS.has(key) && (value === "" || value === undefined)) {
			const previous = this._config[key] ?? "";
			target.value = previous;
			return;
		}
		const config = {
			...this._config,
			[key]: value
		};
		const isVisibilityField = CarLeasingCardEditor.VISIBILITY_FIELDS.has(key);
		if (isVisibilityField) {
			// Visible is the default: store only show_x: false, and drop the legacy hide_x key.
			delete config[`hide_${key.slice("show_".length)}`];
		}
		const isFlag = CarLeasingCardEditor.FLAG_FIELDS.has(key);
		if (value === "" || value === undefined || (isVisibilityField && value === true) || (isFlag && value === false))
			delete config[key];
		this._config = config;
		this.dispatchEvent(
			new CustomEvent("config-changed", {
				detail: {
					config: {
						...this._config
					}
				},
				bubbles: true,
				composed: true,
			}));
	}
}

/* ---------------------------------------------------------------------- */
/*  Vehicle illustrations                                                 */
/*  The body fill is driven by the --vehicle-color                        */
/*  CSS variable set on .car-wrap.                                        */
/* ---------------------------------------------------------------------- */
/* ---------------------------------------------------------------------- */
/*  Registration                                                          */
/* ---------------------------------------------------------------------- */
if (!customElements.get("car-leasing-card")) {
	customElements.define("car-leasing-card", CarLeasingCard);
}

if (!customElements.get("car-leasing-card-editor")) {
	customElements.define("car-leasing-card-editor", CarLeasingCardEditor);
}

window.customCards = window.customCards || [];
window.customCards.push({
	type: "car-leasing-card",
	name: "Car Leasing Card",
	description: "Track mileage usage against your car leasing contract, with extra-km cost estimation.",
	preview: true,
	documentationURL: "https://github.com/KroFR/car-leasing-ha-card",
});

console.info(`%c 🚗 CAR-LEASING-CARD %c v${CARD_VERSION} `, "color: white; background: #3d7bfa; font-weight: 700;", "color: #3d7bfa; background: white; font-weight: 700;");
