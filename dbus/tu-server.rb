#!/usr/bin/env ruby

# inspired by the PackageKit DBus API
# https://www.freedesktop.org/software/PackageKit/gtk-doc/api-reference.html

require "dbus"
require "optparse"
require "rexml/document"
require "securerandom"
require "singleton"
require "thread"

# clean aborting via Ctr+C without a backtrace displayed
Signal.trap("INT") { puts "Aborted"; exit 1 }
Signal.trap("TERM") { puts "Aborted"; exit 1 }

class Configuration
  include Singleton

  attr_accessor :patches
end

OptionParser.new do |parser|
  parser.banner = "Usage: #{$PROGRAM_NAME} [options]"

  parser.on("-p", "--patches FILE", "Read the available patches from a XML file") do |f|
    Configuration.instance.patches = f
  end
end.parse!

# read the available patches, call zypper or read a zypper dump from file
class PatchReader
  attr_reader :path

  def initialize(path = nil)
    @path = path
  end

  # parse the zypper XML output and call the passed block for each found patch
  def read(&block)
    if path
      puts "Reading patches from #{path}"
      xml = File.read(path)
    else
      puts "Reading patches from the system (\"zypper list-patches\")..."
      xml = `zypper --xmlout list-patches`
      puts "Done"
    end

    doc = REXML::Document.new(xml)
    doc.elements.each("//update") do |update|
      patch = {
        "name" => update.attributes["name"],
        "version" => update.attributes["edition"],
        "status" => update.attributes["status"],
        "category" => update.attributes["category"],
        "severity" => update.attributes["severity"],
        "summary" => REXML::XPath.first(update, "summary").text,
        "description" => REXML::XPath.first(update, "description").text
      }

      yield patch
    end
  end
end

# Just for testing the parser
# require "pp"
# p = PatchReader.new("./data/patches.xml")
# p.read {|p| pp p}
# exit 0

class Transaction < DBus::Object
  INTERFACE = "org.opensuse.transactional_update"

  def self.create
    new("/org/opensuse/transactional_update/" + SecureRandom.alphanumeric(16))
  end

  dbus_interface INTERFACE do
    # TODO: add some filtering parameters like in PackageKit?
    dbus_method :GetUpdates do
      # read the updates, emit a signal for each update
      reader = PatchReader.new(Configuration.instance.patches)
      # load the patches in a separate thread to not block the service
      Thread.new do
        reader.read do |p|
          # emit the signal for each patch
          Update(p)
        end
      end
    end

    dbus_signal :Update, "update:a{ss}"
  end
end

class Root < DBus::Object
  INTERFACE = "org.opensuse.transactional_update"
  PATH = "/org/opensuse/transactional_update"

  attr_reader :service, :transactions

  def initialize(service)
    super(PATH)
    @transactions = []
    @service = service
  end

  dbus_interface INTERFACE do
    # FIXME: should be "out ret:o", but that crashes :-(
    dbus_method :CreateTransaction, "out ret:s" do

      transaction = Transaction.create
      service.export(transaction)

      puts "Created DBus object #{transaction.path}"
      transaction.path
    end

    # FIXME: this crashes, a bug in ruby-dbus?
    dbus_method :GetTransactionList, "out ret:ao" do
      transactions.map(&:path)
    end
  end
end

class Service
  NAME = "org.opensuse.transactional_update"

  def self.create(bus)
    bus.request_service(NAME)
  end
end

bus = DBus::SystemBus.instance
service = Service.create(bus)

root = Root.new(service)
service.export(root)

puts "Starting #{Service::NAME} service..."
main = DBus::Main.new
main << bus
main.run