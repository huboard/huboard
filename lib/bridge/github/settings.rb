class Huboard
  module Settings
    def settings
      defaults = {show_all: true}

      the_settings = settings_labels.map do |l|
        match = Huboard.settings_pattern.match l["name"]
        begin
          YAML.load(match[1])
        rescue
          return {}
        end
      end.reduce(:merge)

      defaults.merge(the_settings || {})
    end
  end
end
