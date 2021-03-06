class Revision < ActiveRecord::Base
  belongs_to :wall
  has_attached_file :image, :styles => { :thumb => "100x100>", :square => "300x300#", :original => "1200x1200>" }
  attr_accessible :image, :wall
end
