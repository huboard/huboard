module Saas
  class InvoicesController < Saas::ApplicationController
    def show
      @invoice = Hashie::Mash.new(Stripe::Invoice.retrieve(id: params[:invoice_id], expand: ['customer', 'charge']).to_hash)
      @customer = couch.connection.get("Customers-#{@invoice.customer.id}").body

      render :show, layout: false
    end
  end
end
