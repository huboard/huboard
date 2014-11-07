require 'spec_helper'

describe AccessPipeline do

  class MockCreateBoardUseCase
    include SolidUseCase

    steps :step, :step2
    def step(args)
      continue(args)
    end

    def step2(args)
      continue(args)
    end
  end

  class CreateBoardSample
    include ::AccessPipeline

    usecase MockCreateBoardUseCase do
      success do |arg|
        #Does Stuff
      end

      failure(:bad_mojo) do |details|
        #Does Other Stuff
      end
    end
  end

  let(:sut) { CreateBoardSample.new }

  describe "Mixing the Pipline into an object" do

    it "Object has a usecase" do
      usecase = sut.usecase_class
      expect(usecase).to be(MockCreateBoardUseCase)
    end

    it "Object has a usecase resolver block" do
      usecase_resolver = sut.usecase_resolver
      expect(usecase_resolver).to be_a(Proc)
    end
  end

  describe "Running the Pipeline" do
    let(:argument) { "SomeArg"}

    it "Executes the usecase_resolver with args" do
      sut.run(argument)
    end
  end
end
