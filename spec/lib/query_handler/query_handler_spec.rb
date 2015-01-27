require "spec_helper"

describe QueryHandler do

  let(:sut){ QueryHandler }

  before do
    allow($stdout).to receive(:puts).and_return(nil)
  end

  context "Single Query" do

    it "Returns a successful Query" do
      response = sut.exec {"GoodQuery" }
      expect(response).to eql "GoodQuery"
    end

    it "Returns false on Failed Query" do
      response = sut.exec { BadQuery }
      expect(response).to be false
    end

  end

  context "Chaining Queries" do

    it "Returns the successful Query" do
      response = sut.run do |query|
        query << ->{ BadQuery }
        query << ->{ "GoodQuery" }
      end

      expect(response).to eql "GoodQuery"
    end
    
    it "Returns the first successful Query" do
      response = sut.run do |query|
        query << ->{ "GoodQuery" }
        query << ->{ "AlsoGoodQuery" }
      end

      expect(response).to eql "GoodQuery"
    end

    it "Returns false if all Queries fail" do
      response = sut.run do |query|
        query << ->{ BadQuery }
        query << ->{ AnotherBadQuery }
      end

      expect(response).to be false
    end

    it "Ignore Subsequent Queries on good Query" do
      response = sut.run do |query|
        query << ->{ "GoodQuery" }
        query << ->{ AnotherBadQuery }
        query << ->{ YetAnother }
      end

      expect(response).to eql "GoodQuery"
    end
  end

  context "Logging" do

    context "Default" do

      it "Logs Errors to STDOUT" do
        expect($stdout).to receive(:puts).exactly(3).times

        sut.run do |query|
          query << ->{ BadQuery }
        end
      end
    end

    context "Custom Logger" do

      class CustomLogger
        def log(exception); end
      end

      let(:logger){ CustomLogger.new }
      
      before do
        allow(logger).to receive(:log)

        sut.set_logger do |error|
          logger.log(error)
        end
      end

      it "Logs to the Custom Logger" do
        expect(logger).to receive(:log).once

        sut.run do |query|
          query << ->{ BadQuery }
        end
      end
    end
  end
end
