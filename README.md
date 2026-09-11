[![HACS Custom](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://hacs.xyz/)
[![GitHub Release](https://img.shields.io/github/v/release/KroFR/car-leasing-ha-card)](https://github.com/KroFR/car-leasing-ha-card/releases)
[![Static Badge](https://img.shields.io/badge/Home_Assistant-2024.1+-blue)](https://www.home-assistant.io/)
[![HACS Validation](https://github.com/KroFR/car-leasing-ha-card/actions/workflows/hacs.yaml/badge.svg)](https://github.com/KroFR/car-leasing-ha-card/actions/workflows/hacs.yaml)
[![License](https://img.shields.io/github/license/KroFR/car-leasing-ha-card)](https://github.com/KroFR/car-leasing-ha-card/blob/main/LICENSE)

# 🚗 Car Leasing Card

A custom Lovelace card for [Home Assistant](https://www.home-assistant.io/) that tracks mileage usage against a car leasing contract. It shows progress toward your yearly allowance, how many days are left on the contract, and estimates the extra-km cost if you go over your limit.

| Light Theme | Dark Theme |
|---|---|
| <img width="500" height="433" alt="image" src="https://github.com/user-attachments/assets/83a82b8a-61d4-4d3a-9202-e7c1057517f0" /> | <img width="500" height="433" alt="image" src="https://github.com/user-attachments/assets/59553b3e-7399-459c-bf48-0be66a2ef6d1" /> |

| Information | Description |
|------------|-------------|
| **Current mileage** | The current odometer reading reported by the selected mileage sensor. This value represents the vehicle's actual mileage at the present time. |
| **Driven since start** | The distance driven during the leasing contract. Useful if the vehicle was already used before the contract began. |
| **Expected by today** | The mileage you would be expected to have driven today if your annual allowance was consumed evenly throughout the contract. This helps determine whether you are ahead of pace, on track, or below your expected usage. |
| **Remaining** | The estimated number of kilometers remaining before reaching the total mileage allowance for the entire contract. A negative value indicates that the mileage allowance has been exceeded. |
| **Days left** | The number of days remaining until the end of the leasing contract. Once the contract end date is reached, the card displays **Contract ended** instead of a number. |
| **Ends** | The configured contract end date. This helps you quickly see when the leasing agreement expires and when the vehicle is due for return or renewal. |

## ✨ Features

- Mileage progress bar with yearly markers, comparing actual driven km against the expected pace for the current date.
- Automatic status detection: **On track**, **Ahead of pace**, or **Over limit**, each with its own color.
- Extra-km cost estimation, shown automatically once the allowance is exceeded.
- 7 vehicle illustrations to choose from: Micro, Sedan, CUV, SUV, Van, Campervan, Pickup.
- Configurable info panel (current mileage, driven since start, expected by today, remaining km, days left, contract end date), each field can be hidden independently.
- Light and dark mode support, matching Home Assistant's native color scheme.
- Multilingual support and auto-detection (English, French, German, Spanish, Italian, Portuguese, Dutch).
- Visual editor: fully configurable through the Lovelace UI editor, no YAML required.

## 📦 Installation

### HACS (recommended)

1. Open HACS in Home Assistant.
2. Click on the three dots in the top right corner.
3. Select **Custom repositories**.
4. Add this repository URL: `https://github.com/KroFR/car-leasing-ha-card`
5. Select **Dashboard** as the category.
6. Click **Add**.
7. Search for **Car Leasing Card** and install it.

### Manual

1. Download `car-leasing-card.js` from the `dist` folder of this repository.
2. Copy it to `www/community/car-leasing-card/car-leasing-card.js` in your Home Assistant instance.
3. Go to **Settings > Dashboards > three-dot menu > Resources**.
4. Select **Add resource**, set the URL to `/hacsfiles/car-leasing-ha-card/car-leasing-card.js?v=1`, and set resource type to **JavaScript module**.
5. Refresh your browser.

### Adding the card

Edit any dashboard and select **Add Card**. Search for **Car Leasing Card**, or select **Manual** and use the YAML shown below. Configure the entities either through the visual editor or directly in YAML.

## ⚙️ Configuration

| Name | Type | Required | Default | Description |
|---|---|---|---|---|
| `type` | string | yes | — | `custom:car-leasing-card` |
| `mileage_entity` | string | yes | — | Sensor providing the car's current mileage (km) |
| `contract_start` | string | yes | — | Contract start date (`YYYY-MM-DD`) |
| `contract_end` | string | yes | — | Contract end date (`YYYY-MM-DD`) |
| `name` | string | no | Card Leasing | Card title |
| `vehicle_type` | string | no | `sedan` | `micro`, `sedan`, `cuv`, `suv`, `van`, `campervan`, `pickup` |
| `language` | string | no | `auto` | `auto`, `en`, `fr`, `de`, `es`, `it`, `pt`, `nl` |
| `start_mileage` | number | no | `0` | Odometer reading at contract start. Useful if your car is second-hand. |
| `annual_allowance` | number | no | `15000` | Km allowed per year by the contract |
| `extra_km_cost` | number | no | `0` | Cost charged per km once the total allowance is exceeded |
| `currency` | string | no | `€` | Currency symbol used for cost display |
| `hide_car_image` | boolean | no | `false` | Hide the vehicle illustration |
| `hide_progress_bar` | boolean | no | `false` | Hide the mileage progress bar |
| `hide_current_mileage` | boolean | no | `false` | Hide the current mileage value |
| `hide_driven` | boolean | no | `false` | Hide the driven-since-start value |
| `hide_expected_today` | boolean | no | `false` | Hide the expected-by-today value |
| `hide_remaining` | boolean | no | `false` | Hide the remaining km value |
| `hide_days_left` | boolean | no | `false` | Hide the days-left value |
| `hide_contract_ends` | boolean | no | `false` | Hide the contract end date value |
| `hide_extra_alert` | boolean | no | `false` | Never show the extra-cost alert, even if the allowance is exceeded |

## 📝 Usage examples

### Minimal configuration

Only the required entity, everything else falls back to defaults.

| Light Theme | Dark Theme |
|---|---|
| <img width="501" height="419" alt="image" src="https://github.com/user-attachments/assets/74d8424a-98f8-4a1a-ac12-35cd8800db64" /> | <img width="503" height="426" alt="image" src="https://github.com/user-attachments/assets/65745d33-ec98-475a-bb1a-ddb9da6a0413" /> |

```yaml
type: custom:car-leasing-card
mileage_entity: sensor.car_odometer
contract_start: "2024-06-01"
contract_end: "2027-06-01"
```

### Full configuration

The complete configuration with leasing on track indicator

| Light Theme | Dark Theme |
|---|---|
| <img width="502" height="435" alt="image" src="https://github.com/user-attachments/assets/f8653722-d866-4b18-8a79-65c7a121050a" /> | <img width="504" height="438" alt="image" src="https://github.com/user-attachments/assets/512d9456-0945-45cb-81a5-7403860e80a7" /> |

```yaml
type: custom:car-leasing-card
name: My Tesla Model 3
mileage_entity: sensor.car_odometer
contract_start: "2024-06-01"
contract_end: "2027-06-01"
vehicle_type: suv
language: en
start_mileage: 12
annual_allowance: 20000
extra_km_cost: 0.12
currency: "€"
```

The complete configuration with leasing over limit and cost estimation

| Light Theme | Dark Theme |
|---|---|
| <img width="501" height="474" alt="image" src="https://github.com/user-attachments/assets/359193eb-69cd-446f-b915-608a4e8bd66f" /> | <img width="501" height="475" alt="image" src="https://github.com/user-attachments/assets/2036bf70-ff08-4e90-aff8-94a6309ab62f" /> |

```yaml
type: custom:car-leasing-card
mileage_entity: sensor.duster_he135zn_mileage
contract_end: '2027-09-12'
contract_start: '2025-08-13'
hide_contract_ends: true
hide_current_mileage: true
annual_allowance: 5000
vehicle_type: campervan
extra_km_cost: 0.094
currency: "$"
```

### Hiding fields from the info panel

| Light Theme | Dark Theme |
|---|---|
| <img width="502" height="271" alt="image" src="https://github.com/user-attachments/assets/a5dad5d4-8651-4d29-8111-88ccd372242d" /> | <img width="502" height="273" alt="image" src="https://github.com/user-attachments/assets/720a82b5-e577-448a-882c-cb4d996e5090" /> |

```yaml
type: custom:car-leasing-card
mileage_entity: sensor.car_odometer
contract_start: "2024-06-01"
contract_end: "2027-06-01"
hide_contract_ends: true
hide_car_image: true
hide_current_mileage: true
```

## 📄 License

[<img width="78" height="20" alt="image" src="https://github.com/user-attachments/assets/c14c93d7-50c2-4726-9a47-77f6c466e5b5" />](https://github.com/KroFR/car-leasing-ha-card/blob/main/LICENSE)
