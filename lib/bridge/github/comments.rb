class Huboard
  module Comments
    def comments(id)
      gh.issues.comments(id)
    end
  end
end
