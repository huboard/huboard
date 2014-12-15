require 'faraday'
require 'json/ext'
require 'multi_json'

class Ghee
  # Custom error class for rescuing from all GitHub errors
  class Error < StandardError
    def initialize(response=nil)
      @response = response
      super(build_error_message)
    end

    def response_body
      @response_body ||= if (body = @response[:body]) && !body.empty?
        if false and body.is_a?(String)
          MultiJson.load(body, :symbolize_keys => true)
        else
          body
        end
      else
        nil
      end
    end

    private

    def build_error_message
      return nil  if @response.nil?

      message = if response_body
        "#{response_body["error"] || response_body["message"] || ''}"
      else
        ''
      end

      errors = unless message.empty?
        response_body.errors ?  " #{response_body.errors.to_a.map{|e|e.message || e.code}.join(', ')} " : ''
      end

      "#{message}#{errors}"
    end
  end

  # Raised when GitHub returns a 400 HTTP status code
  class BadRequest < Error; end

  # Raised when GitHub returns a 401 HTTP status code
  class Unauthorized < Error; end

  # Raised when GitHub returns a 403 HTTP status code
  class Forbidden < Error; end

  # Raised when GitHub returns a 404 HTTP status code
  class NotFound < Error; end

  # Raised when GitHub returns a 406 HTTP status code
  class NotAcceptable < Error; end

  # Raised when GitHub returns a 422 HTTP status code
  class UnprocessableEntity < Error; end

  # Raised when GitHub returns a 500 HTTP status code
  class InternalServerError < Error; end

  # Raised when GitHub returns a 501 HTTP status code
  class NotImplemented < Error; end

  # Raised when GitHub returns a 502 HTTP status code
  class BadGateway < Error; end

  # Raised when GitHub returns a 503 HTTP status code
  class ServiceUnavailable < Error; end
end

# @api private
module Faraday
  class Response::RaiseGheeError < Response::Middleware
    ERROR_MAP = {
      400 => Ghee::BadRequest,
      401 => Ghee::Unauthorized,
      403 => Ghee::Forbidden,
      406 => Ghee::NotAcceptable,
      422 => Ghee::UnprocessableEntity,
      500 => Ghee::InternalServerError,
      501 => Ghee::NotImplemented,
      502 => Ghee::BadGateway,
      503 => Ghee::ServiceUnavailable
    }

    def on_complete(response)
      key = response[:status].to_i
      raise ERROR_MAP[key].new(response) if ERROR_MAP.has_key? key
    end
  end
end
