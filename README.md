[![HACS Default](https://img.shields.io/badge/HACS-Default-green.svg)](https://hacs.xyz/)
[![GitHub Release](https://img.shields.io/github/v/release/KroFR/car-leasing-ha-card)](https://github.com/KroFR/car-leasing-ha-card/releases)
[![Static Badge](https://img.shields.io/badge/Home_Assistant-2024.1+-blue)](https://www.home-assistant.io/)
[![HACS Validation](https://github.com/KroFR/car-leasing-ha-card/actions/workflows/hacs.yaml/badge.svg)](https://github.com/KroFR/car-leasing-ha-card/actions/workflows/hacs.yaml)
[![License](https://img.shields.io/github/license/KroFR/car-leasing-ha-card)](https://github.com/KroFR/car-leasing-ha-card/blob/main/LICENSE)

# 🚗 Car Leasing Card

A custom Lovelace card for [Home Assistant](https://www.home-assistant.io/) that tracks mileage usage against a car leasing contract. It shows progress toward your yearly allowance, how many days are left on the contract, and estimates the extra-km cost if you go over your limit.

| Light Theme | Dark Theme |
|---|---|
| <img width="502" height="513" alt="image" src="https://github.com/user-attachments/assets/aae13867-42d5-46e9-9b63-2d3966b8f0a7" /> | <img width="502" height="516" alt="image" src="https://github.com/user-attachments/assets/772809be-ff5f-4a89-bb7e-0b93685b8dbf" /> |

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

### Mileage is above the expected limit

| Light Theme | Dark Theme |
|---|---|
| <img width="501" height="463" alt="image" src="https://github.com/user-attachments/assets/6abac0e7-fa69-4323-9405-3e7a8a2fa8bb" /> | <img width="502" height="464" alt="image" src="https://github.com/user-attachments/assets/386f6763-0f31-4f25-b3a4-d5a6748ffada" /> |

```yaml
type: custom:car-leasing-card
mileage_entity: sensor.car_odometer
contract_end: '2029-09-12'
contract_start: '2025-08-13'
annual_allowance: 15000
vehicle_color: '#2fd723'
vehicle_type: motorcycle-roadster
name: Hornet
show_remaining: false
show_expected_today: false
```

### Mileage exceeds the contracted mileage

| Light Theme | Dark Theme |
|---|---|
| <img width="500" height="541" alt="image" src="https://github.com/user-attachments/assets/3bd31d1a-e04f-4f64-af7e-0066b9808ac2" /> | <img width="503" height="541" alt="image" src="https://github.com/user-attachments/assets/c66ce408-56ce-4f52-8044-7322389001b6" />
 |

```yaml
type: custom:car-leasing-card
mileage_entity: sensor.car_odometer
contract_end: '2026-09-12'
contract_start: '2025-08-13'
annual_allowance: 20000
vehicle_color: '#bc8a16'
vehicle_type: tesla-model3
name: Tesla Model 3
show_remaining: false
show_expected_today: false
extra_km_cost: 0.094
```

### Vehicle color and orientation

| Light Theme | Dark Theme |
|---|---|
| <img width="501" height="461" alt="image" src="https://github.com/user-attachments/assets/39595995-15b7-463b-8c66-1dbc5fd4c09a" /> | <img width="502" height="464" alt="image" src="https://github.com/user-attachments/assets/f38079d8-44bb-4876-b282-970e30331998" /> |

```yaml
type: custom:car-leasing-card
mileage_entity: sensor.car_odometer
name: Wave Rider Van
contract_end: '2029-09-12'
contract_start: '2025-08-13'
annual_allowance: 25000
vehicle_type: camper-van
vehicle_color: '#cf8607'
show_expected_today: false
show_driven: false
flip_vehicle: true
```

### Compact header

| Light Theme | Dark Theme |
|---|---|
| <img width="500" height="297" alt="image" src="https://github.com/user-attachments/assets/8fc382aa-a537-4a33-936c-1c2aa30f6559" /> | <img width="501" height="300" alt="image" src="https://github.com/user-attachments/assets/5d64dd62-f992-4620-a25c-11a4e9c6984f" /> |

```yaml
type: custom:car-leasing-card
mileage_entity: sensor.car_odometer
contract_end: '2029-09-12'
contract_start: '2025-08-13'
annual_allowance: 20000
vehicle_color: '#0778cf'
show_expected_today: false
show_driven: false
flip_vehicle: true
show_title_icon: false
show_title: false
show_days_left: false
show_current_mileage: false
show_remaining: false
show_contract_ends: false
vehicle_type: tesla-model3
show_status_chip: false

```

## 📄 License

[<img width="78" height="20" alt="image" src="https://github.com/user-attachments/assets/c14c93d7-50c2-4726-9a47-77f6c466e5b5" />](https://github.com/KroFR/car-leasing-ha-card/blob/main/LICENSE)
