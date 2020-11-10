#PACKAGE_NAME := $(shell awk '/"name":/ {gsub(/[",]/, "", $$2); print $$2}' package.json)

SERVICE_FILE := "org.opensuse.transactional_update.service"
CONFIG_FILE := "org.opensuse.transactional_update.conf"

DBUS_SERVICE_DIR := "/usr/share/dbus-1/system-services"
DBUS_CONF_DIF := "/etc/dbus-1/system.d/org.freedesktop.NetworkManager.conf"

install:
	@echo "Installing $(SERVICE_FILE)..."
	sed "s#@PATH@#$(CURDIR)#" $(SERVICE_FILE) > $(DBUS_SERVICE_DIR)/$(SERVICE_FILE)
	@echo "Installing $(CONFIG_FILE)..."
	cp $(CONFIG_FILE) $(DBUS_CONF_DIF)

