# IP Indicator

A simple GNOME extension that shows your public/local IP addresses with a country flag right in your top panel.

- **public IP** & **country flag** displayed in the panel
- **local IP** shown in the menu
- **auto-refresh** (or disable it)
- **multiple sources** with automatic fallback
- **flexible positioning** so place it left, center, or right

### Quick Install

```bash
# download this repo
git clone https://github.com/amirilf/ip-indicator.git
cd ip-indicator
./install.sh

# now restart your GNOME Shell
#  - X11 -> press alt+f2, type r
#  - Wayland -> simply logout and login again

# enable (if restarting didn't already enable it)
gnome-extensions enable ip-indicator@amirilf.ir
```

### API Sources

- ip-api.com
- ipapi.co
- ipify.org + ip-api.com
- ip.sb
- ipwho.is
- ip-api.io
- geojs.io

#### Note: Only tested on GNOME Shell 42
