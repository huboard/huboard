QueryHandler.set_logger do |e|
  ::Raygun.track_exception(e, custom_data: {generated_by: 'QueryHandler'})
end
