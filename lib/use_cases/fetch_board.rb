module UseCase
  class FetchBoard 
    include SolidUseCase

    attr_accessor :client

    def initialize(client)
      @client = client
    end

    steps :repo_exists?, :board_exists?, :issues_enabled?

    def repo_exists? params
      board = client.board params[:user], params[:repo]
      if board.repo_exists?
        continue board
      else
        fail :not_found
      end

    end

    def board_exists?(board)
      if board.has_board?
        continue board
      else
        fail :no_board
      end
    end

    def issues_enabled?(board)
      if board.issues_enabled?
        continue board
      else
        fail :no_issues
      end

    end

  end
end
