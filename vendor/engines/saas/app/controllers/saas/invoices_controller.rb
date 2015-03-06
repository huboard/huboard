module Saas
  class InvoicesController < Saas::ApplicationController
    def show
      user = gh.users params[:name]
      docs = couch.customers.findPlanById user['id']
      if docs.rows.any?
        plan_doc = docs.rows.first.value
        plan_doc.additional_info = params[:additional_info]

        couch.customers.save plan_doc
        render json: {success: true, message: "Info updated"}
      else
        render json: {success: false, message: "Unable to find customer"}
      end

    end
  end
end
