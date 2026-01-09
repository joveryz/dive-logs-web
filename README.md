# Dive Logs

This is a web-based dive log viewer and analyzer.

## Pipeline Workflow

1. Any change pushed to the `master` branch of this repo triggers a GitHub Actions workflow in repo [dive-logs-deployment](https://github.com/joveryz/dive-logs-deployment).

2. Any change pushed to the `master` branch of repo [dive-log-exporter](https://github.com/joveryz/dive-log-exporter) builds the exporter and triggers a GitHub Actions workflow in repo [dive-logs-deployment](https://github.com/joveryz/dive-logs-deployment).

3. The workflow in [dive-logs-deployment](https://github.com/joveryz/dive-logs-deployment) prepares the data, builds the site, and deploys it to GitHub Pages.

    - Download the latest release of repo [dive-log-exporter](https://github.com/joveryz/dive-log-exporter)
    
    - Run the exporter to export dive logs from `./data/*` to `./src/data/*.csv`
    
    - Build the site with `npm run build`
    
    - Deploy the site to GitHub Pages

## Data

The raw dive log data is stored in the `./data` directory. The data is exported to CSV files in the `./src/data` directory during the build process.

For Garmin fit files, please name them with `{date}_{buddyName}_{location}_{site}_{diverName}.fit`, e.g., `20251231_Jovery_Beijing_HiDive_Yiqu.fit`.

If there is no buddy, please use `Solo`, e.g., `20260108_Solo_Beijing_HiDive_Jovery.fit`.

## Tech

- React
- TypeScript
- Vite
- Tailwind CSS
- Recharts
- Zustand

## Quick Start

```bash
npm install
npm run dev
```

## License

MIT
