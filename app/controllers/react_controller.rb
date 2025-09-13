class ReactController < ApplicationController
  allow_unauthenticated_access only: [ :index, :static ]

  def index
    file_path = Rails.root.join('public', 'react', 'index.html')
    if file_path.exist?
      send_file file_path,
        type: 'text/html',
        disposition: 'inline',
        layout: false
    else
      render plain: 'React application not found. Please run `npm run build` in the frontend directory.', status: :not_found
    end
  end

  # Handle static files in development
  def static
    path = Rails.root.join('public', 'react', params[:path])
    if path.exist?
      send_file path, disposition: 'inline'
    else
      head :not_found
    end
  end
end
