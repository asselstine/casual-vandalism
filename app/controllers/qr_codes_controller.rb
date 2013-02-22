class QrCodesController < ApplicationController
  def all
    @walls = Wall.all
    @size = 4
    render 'all', :layout => "qrcode_list"
  end
end