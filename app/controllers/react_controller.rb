class ReactController < ApplicationController
  def index
    render file: Rails.root.join("public", "react", "index.html"), layout: false
  end
end
