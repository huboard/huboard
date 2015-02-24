class Huboard
  module Hooks
    def hook_exists?
      return true if gh.hooks.raw.status == 404
      gh.hooks.any? { |x| x['name'] == 'huboard' }
    end

    def delete_hook(id)
      gh.hooks(id).destroy
    end

    def create_hook
      return :message => "hook already exists", :success => false if hook_exists?

      gh.hooks.create(
        {
          name: 'huboard',
          config: {},
          active: true,
        }
      )
    end
  end
end
