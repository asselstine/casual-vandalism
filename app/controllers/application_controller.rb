class ApplicationController < ActionController::Base
  protect_from_forgery
  def after_sign_out_path_for(resource_or_scope)
    path = root_path
    if params[:after]
      path = params[:after]
    end
    path
  end
end
