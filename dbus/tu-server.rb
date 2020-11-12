#!/usr/bin/env ruby

# inspired by the PackageKit DBus API
# https://www.freedesktop.org/software/PackageKit/gtk-doc/api-reference.html

require "dbus"
require "forwardable"
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

  class << self
    extend Forwardable
    def_delegators :instance, :patches, :patches=, :session_bus, :session_bus=
  end

  attr_accessor :patches, :session_bus
end

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

class PatchInstaller
  # the selected patches
  attr_reader :patches

  def initialize(patches)
    @patches = patches
  end

  def install
    # FIXME: install just the selected patches,
    # the current transactional-update script can only run
    # full "zypper patch" installing everything...

    puts "Installing patches..."
    # TODO: Tumbleweed needs "transactional-update up" here...
    system "transactional-update patch"
  end
end

# Just for testing the parser
# require "pp"
# p = PatchReader.new("./data/patches.xml")
# p.read {|p| pp p}
# exit 0

class Transaction < DBus::Object
  INTERFACE = "org.opensuse.TransactionalUpdate"

  def self.create
    new("/org/opensuse/TransactionalUpdate/" + SecureRandom.alphanumeric(16))
  end

  dbus_interface INTERFACE do
    # TODO: add some filtering parameters like in PackageKit?
    dbus_method :GetUpdates do
      # read the updates, emit a signal for each update
      reader = PatchReader.new(Configuration.patches)
      # load the patches in a separate thread to not block the service
      Thread.new do
        reader.read do |p|
          # emit the signal for each patch
          Update(p)
        end
        Finished()
        # TODO: delete the transaction and unexport it from DBus after it is finished?
      end
    end

    # report a patch
    dbus_signal :Update, "update:a{ss}"
    # signal finished operation
    dbus_signal :Finished
    # signal an error during operation
    dbus_signal :Error, "error:s"
  end
end

class Root < DBus::Object
  INTERFACE = "org.opensuse.TransactionalUpdate"
  PATH = "/org/opensuse/TransactionalUpdate"

  attr_reader :service, :transactions

  def initialize(service)
    super(PATH)
    @transactions = []
    @service = service
  end

  dbus_interface INTERFACE do
    dbus_method :CreateTransaction, "out ret:o" do

      transaction = Transaction.create
      service.export(transaction)
      transactions << transaction

      puts "Created DBus object #{transaction.path}"
      [ transaction.path ]
    end

    dbus_method :GetTransactionList, "out ret:ao" do
      [ transactions.map(&:path) ]
    end
  end
end

class Service
  NAME = "org.opensuse.TransactionalUpdate"

  def self.create(bus)
    bus.request_service(NAME)
  end
end

OptionParser.new do |parser|
  parser.banner = "Usage: #{$PROGRAM_NAME} [options]"

  parser.on("-p", "--patches FILE", "Read the available patches from a XML file") do |f|
    Configuration.patches = f
  end

  parser.on("-s", "--session-bus", "Use the session bus instead of the system bus") do |s|
    Configuration.session_bus = s
  end
end.parse!

if Configuration.session_bus
  puts "Connecting to the session bus..."
  bus = DBus::SessionBus.instance
else
  puts "Connecting to the system bus..."
  bus = DBus::SystemBus.instance
end

service = Service.create(bus)

root = Root.new(service)
service.export(root)

puts "Starting #{Service::NAME} service..."
main = DBus::Main.new
main << bus
main.run