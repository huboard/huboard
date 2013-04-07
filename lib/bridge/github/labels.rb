class Huboard

  module Labels

    def labels
      gh.labels
    end

    def other_labels
      labels.reject { |l| Huboard.all_patterns.any? {|p| p.match l.name } }
    end

    def settings_labels
      labels.select{|l| Huboard.settings_pattern.match l.name }
    end

    def column_labels
      labels.select{|l| Huboard.column_pattern.match l.name }.map do |l| 
        match = Huboard.column_pattern.match l.name
          l[:index] = match[:id]
          l[:text] = match[:name]
          l
      end
    end

    def link_labels
      labels.select{|l| Huboard.link_pattern.match l.name }.map do |l|
        match = Huboard.link_pattern.match l.name
        l.user = match[:user_name]
        l.repo = match[:repo]
        l
      end
    end

  end
  
end
