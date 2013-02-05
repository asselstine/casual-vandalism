class Image < ActiveRecord::Base
  # attr_accessible :title, :body
  attr_accessible :x, :y, :canvas
  has_attached_file :canvas
  belongs_to :wall
end
