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
      @labels ||= gh.labels.all
      @labels.is_a?(Array) ? @labels : []
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

    def create_label(params)
      gh.labels.create params
    end
    
    def destroy_label(name)
      gh.labels(name).destroy
    end
    alias_method :destroy_link, :destroy_label


    def create_link(repo)
      label_name = "Link <=> #{repo}"
      match = Huboard.link_pattern.match label_name

      if match and repo_exists?(match[:user_name], match[:repo])
        new_link = create_label name: label_name, color: random_color
        new_link.user = match[:user_name]
        new_link.repo = match[:repo]
        new_link
      else
        nil
      end

    end

    def copy_board(columns)
      column_labels.each do |column|
        destroy_label(column["name"])
      end
      columns.each do |column|
        create_label name: column["name"], color: column["color"]
      end
    end
    
    def random_color
      colors = %w{ e11d21 eb6420 eb6420 fbca04 009800 006b75 207de5 0052cc 5319e7 }
      colors.sample
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
