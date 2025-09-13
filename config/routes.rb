Rails.application.routes.draw do
  # API routes
  resource :session
  resources :passwords, param: :token
  resources :expenses
  resources :categories do
    collection do
      post "update_position" => "categories#update_position"
    end
  end
  resources :users

  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # PWA files
  get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker

  # Serve static files from /public/react
  get "/react/*path", to: "react#static", as: :react_static,
    constraints: ->(req) { req.path !~ /\.(js|css|png|jpg|jpeg|gif|svg|ico|json)$/ }

  # Handle assets with proper caching
  get "/assets/*path", to: redirect("/react/assets/%{path}"),
    constraints: { path: /[^\/]+/ }

  # Handle root favicon
  get "/et_192x192.png", to: redirect("/react/et_192x192.png")
  root "react#index"

  # Handle all other routes to React
  get "*path", to: "react#index", constraints: ->(req) do
    !req.xhr? && req.format.html?
  end

  mount MissionControl::Jobs::Engine, at: "/admin/jobs"
end
