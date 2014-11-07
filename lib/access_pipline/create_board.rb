module Pipeline
  class CreateBoard
    include AccessPipeline

    usecase UseCase::CreateBoard do
      success do |context|
        user, repo = context.params[:user], context.params[:repo]
        context.redirect#to_some_repo
      end

      failure(:bad_credentials) do |error|
        #some redirect
      end

      failure(:no_push_access) do |error|

      end
    end
  end
end

Pipeline::ViewBoard.run(self)

failure(:no_board) do |context|
  Pipeline::CreateBoard.run(self)
end
