[![HACS Default](https://img.shields.io/badge/HACS-Default-green.svg)](https://hacs.xyz/)
[![GitHub Release](https://img.shields.io/github/v/release/KroFR/car-leasing-ha-card)](https://github.com/KroFR/car-leasing-ha-card/releases)
[![Static Badge](https://img.shields.io/badge/Home_Assistant-2024.1+-blue)](https://www.home-assistant.io/)
[![HACS Validation](https://github.com/KroFR/car-leasing-ha-card/actions/workflows/hacs.yaml/badge.svg)](https://github.com/KroFR/car-leasing-ha-card/actions/workflows/hacs.yaml)
[![License](https://img.shields.io/github/license/KroFR/car-leasing-ha-card)](https://github.com/KroFR/car-leasing-ha-card/blob/main/LICENSE)

# 🚗 Car Leasing Card

A custom Lovelace card for [Home Assistant](https://www.home-assistant.io/) that tracks mileage usage against a car leasing contract. It shows progress toward your yearly allowance, how many days are left on the contract, and estimates the extra-km cost if you go over your limit.

| Light Theme | Dark Theme |
|---|---|
| <img width="501" height="461" alt="image" src="https://github.com/user-attachments/assets/882d4528-f077-4eb6-b5bd-0da73fc5d415" /> | <img width="502" height="462" alt="image" src="https://github.com/user-attachments/assets/d0645885-d803-468b-aaeb-c3379ed7608c" /> |

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
- 17 vehicle illustrations to choose from, from an electric bike to a motorhome (see [Vehicle types](#vehicle-types)), with a custom color and an option to flip the vehicle to face left.
- Every element can be shown or hidden independently. The progress bar is always displayed.
- Light and dark mode support, matching Home Assistant's native color scheme.
- Multilingual support and auto-detection (English, French, German, Spanish, Italian, Portuguese, Dutch).
- Visual editor: fully configurable through the Lovelace UI editor, no YAML required.

## 📦 Installation

### HACS (recommended)
Use this link to directly go to the repository in HACS:

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=KroFR&repository=car-leasing-ha-card)

or

1. Install HACS if you don't have it already
2. Open HACS in Home Assistant
3. Search for "Car Leasing Card"
4. Click the download button

### Manual

1. Download `car-leasing-card.js` from the `dist` folder of this repository.
2. Copy it to `<config>/www/car-leasing-card.js` in your Home Assistant instance.
3. Go to **Settings > Dashboards > three-dot menu > Resources**.
4. Select **Add resource**, set the URL to `/local/car-leasing-card.js?v=1`, and set resource type to **JavaScript module**.
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
| `name` | string | no | `Car Leasing` | Card title. The default is translated to the card language. |
| `vehicle_type` | string | no | `sedan` | Vehicle illustration, see [Vehicle types](#vehicle-types) |
| `vehicle_color` | string | no | `#ffffff` | Vehicle color as `#rgb` or `#rrggbb`. Any other value falls back to white. |
| `flip_vehicle` | boolean | no | `false` | Mirror the illustration horizontally to put the front of the vehicle on the left |
| `language` | string | no | `auto` | `auto`, `en`, `fr`, `de`, `es`, `it`, `pt`, `nl` |
| `start_mileage` | number | no | `0` | Odometer reading at contract start. Useful if your car is second-hand. |
| `annual_allowance` | number | no | `15000` | Km allowed per year by the contract |
| `extra_km_cost` | number | no | `0` | Cost charged per km once the total allowance is exceeded |
| `currency` | string | no | `€` | Currency symbol used for cost display |
| `ahead_tolerance_pct` | number | no | `0` | Controls how far above the expected mileage pace a contract can go before switching from "On track" to "Ahead of pace". Set as a percentage. |
| `show_title_icon` | boolean | `true` | Show the car icon next to the card title |
| `show_title` | boolean | `true` | Show the card title |
| `show_status_chip` | boolean | `true` | Show the status chip (On track, Ahead of pace, Over limit) |
| `show_car_image` | boolean | `true` | Show the vehicle illustration |
| `show_progress_badge` | boolean | `true` | Show the km-gap badge above the progress bar. The pointer arrow always stays visible. |
| `show_current_mileage` | boolean | `true` | Show the current mileage value |
| `show_driven` | boolean | `true` | Show the driven-since-start value |
| `show_expected_today` | boolean | `true` | Show the expected-by-today value |
| `show_remaining` | boolean | `true` | Show the remaining km value |
| `show_days_left` | boolean | `true` | Show the days-left value |
| `show_contract_ends` | boolean | `true` | Show the contract end date value |
| `show_extra_alert` | boolean | `true` | Show the extra-cost alert when the allowance is exceeded |

### Vehicle types

| Value | Vehicle |
|---|---|
| `camper-van` | Camper van |
| `caravan` | Caravan |
| `cargo-van` | Cargo van |
| `segment-a` | City car |
| `compact` | Compact hatchback |
| `european-delivery-truck` | Delivery truck |
| `e-bike` | Electric bike |
| `estate-car` | Estate car |
| `micro` | Micro car |
| `motorcycle-roadster` | Motorcycle (roadster) |
| `motorhome` | Motorhome |
| `mpv` | MPV |
| `pickup-truck` | Pickup truck |
| `scooter` | Scooter |
| `sedan` | Sedan (default) |
| `suv` | SUV |
| `tesla-model3` | Tesla Model 3 |

## 📝 Usage examples

### Minimal configuration

Only the required entities, everything else falls back to defaults.

| Light Theme | Dark Theme |
|---|---|
| <img width="471" height="448" alt="image" src="https://github.com/user-attachments/assets/5c11b765-a077-4985-b81f-366635ede752" /> | <img width="474" height="450" alt="image" src="https://github.com/user-attachments/assets/cb3b6adb-437b-4a70-887c-98451d39bd4b" /> |

```yaml
type: custom:car-leasing-card
mileage_entity: sensor.car_odometer
contract_end: '2029-09-12'
contract_start: '2025-08-13'
```

### Full configuration

The complete configuration with leasing on track indicator

| Light Theme | Dark Theme |
|---|---|
| <img width="471" height="459" alt="image" src="https://github.com/user-attachments/assets/fee29edf-db5f-40e9-9489-bed20573a086" /> | <img width="474" height="461" alt="image" src="https://github.com/user-attachments/assets/2457daf8-930f-48f9-afa3-c76a1b57a9d5" /> |

```yaml
type: custom:car-leasing-card
mileage_entity: sensor.car_odometer
name: Wave Rider Van
contract_end: '2029-09-12'
contract_start: '2025-08-13'
language: en
annual_allowance: 25000
extra_km_cost: 0.12
currency: €
vehicle_type: cargo-van
```

The complete configuration with leasing over limit and cost estimation

| Light Theme | Dark Theme |
|---|---|
| <img width="472" height="499" alt="image" src="https://github.com/user-attachments/assets/e247d8d5-9c5d-45c4-aec0-28e7c9567fd2" /> | <img width="473" height="500" alt="image" src="https://github.com/user-attachments/assets/b54a5c49-d950-473c-a8e8-f0cbdcc8262c" /> |

```yaml
type: custom:car-leasing-card
mileage_entity: sensor.car_odometer
contract_end: '2027-09-12'
contract_start: '2025-08-13'
show_contract_ends: false
show_current_mileage: false
annual_allowance: 5000
vehicle_type: camper-van
extra_km_cost: 0.094
currency: "$"
```

### Hiding fields from the info panel

| Light Theme | Dark Theme |
|---|---|
| <img width="470" height="286" alt="image" src="https://github.com/user-attachments/assets/5b7eea2c-83aa-479d-a74d-07dff699d541" /> | <img width="472" height="285" alt="image" src="https://github.com/user-attachments/assets/45d13568-8fd3-443a-9b7b-f506b6c58016" /> |

```yaml
type: custom:car-leasing-card
mileage_entity: sensor.car_odometer
name: Tesla Model 3
contract_end: '2029-09-12'
contract_start: '2025-08-13'
show_car_image: false
show_current_mileage: false
annual_allowance: 21000
show_expected_today: false
```

### Vehicle color and orientation

A blue SUV with its front on the left.

```yaml
type: custom:car-leasing-card
mileage_entity: sensor.car_odometer
contract_end: '2029-09-12'
contract_start: '2025-08-13'
vehicle_type: suv
vehicle_color: '#1e5aa8'
flip_vehicle: true
```

### Compact header

Only the status chip is kept in the header.

```yaml
type: custom:car-leasing-card
mileage_entity: sensor.car_odometer
contract_end: '2029-09-12'
contract_start: '2025-08-13'
show_title_icon: false
show_title: false
```

## 📄 License

[<img width="78" height="20" alt="image" src="https://github.com/user-attachments/assets/c14c93d7-50c2-4726-9a47-77f6c466e5b5" />](https://github.com/KroFR/car-leasing-ha-card/blob/main/LICENSE)
