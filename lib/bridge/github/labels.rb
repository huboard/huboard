class Huboard

  module Labels

    module ColumnLabel
      def self.extended(l)
        match = Huboard.column_pattern.match l.name
        l[:index] = match[:id]
        l[:text] = match[:name]
        if Huboard.wip_pattern =~ l[:text]
          m = Huboard.wip_pattern.match l[:text]
          text = l[:text]
          wip = m[:wip]
          all = m[:all]
          l[:text] = text[0..text.length - all.length].strip
          l[:wip] = wip
        else
          l[:wip] = 0
        end
      end
    end

    def labels
      labels = gh.labels
      labels.is_a?(Array) ? labels : []
    end

    def other_labels
      labels.reject { |l| Huboard.all_patterns.any? {|p| p.match l.name } }
    end

    def settings_labels
      labels.select{|l| Huboard.settings_pattern.match l.name }
    end

    def column_labels
      columns = labels.select{|l| Huboard.column_pattern.match l.name }.map do |l| 
          l.extend(ColumnLabel)
      end

      columns = columns.sort_by {|i| i[:index] }

      if columns.any?
        columns.first[:is_first] = true
        columns.last[:is_last] = true
      end

      columns
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
