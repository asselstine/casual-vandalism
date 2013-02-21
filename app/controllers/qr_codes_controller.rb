class QrCodesController < ApplicationController
  def all
    @walls = Wall.all
    render 'all', :layout => "raw"
  end
end
